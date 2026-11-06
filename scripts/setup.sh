#!/usr/bin/env bash
# UX-AI environment setup for macOS and Linux.
# Checks the required toolchain and installs whatever is missing or outdated.
# Windows users: run scripts/setup.ps1 instead.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
VERSIONS_FILE="$SCRIPT_DIR/tool-versions.txt"
TOOLS="git uv python node" # order matters: python is installed through uv
UV_BIN_DIR="$HOME/.local/bin"
FNM_DIR="$HOME/.local/share/fnm"
RC_BEGIN="# >>> UX-AI toolchain >>>"
RC_END="# <<< UX-AI toolchain <<<"

MODE="install"
ASSUME_YES=0
MISSING=""
APT_UPDATED=0

usage() {
  cat <<'EOF'
Usage: scripts/setup.sh [options]

Checks that the UX-AI toolchain (git, uv, Python, Node.js) is installed
and installs anything missing or outdated, then installs project
dependencies when ml/ or web/ exist.

Options:
  --check     Only report status; install nothing. Exits 1 if anything is
              missing or outdated.
  --yes, -y   Install without asking for confirmation.
  --help, -h  Show this help.

Minimum versions live in scripts/tool-versions.txt.
Windows users: run scripts/setup.ps1 instead.
EOF
}

for arg in "$@"; do
  case "$arg" in
    --check) MODE="check" ;;
    --yes | -y) ASSUME_YES=1 ;;
    --help | -h) usage; exit 0 ;;
    *) printf 'Unknown option: %s\n\n' "$arg" >&2; usage >&2; exit 2 ;;
  esac
done

info() { printf '%s\n' "$*"; }
warn() { printf 'WARN: %s\n' "$*" >&2; }
die() { printf 'ERROR: %s\n' "$*" >&2; exit 1; }

OS="$(uname -s)"
case "$OS" in
  Darwin | Linux) ;;
  *) die "Unsupported OS '$OS'. On Windows run scripts/setup.ps1." ;;
esac

[ -f "$VERSIONS_FILE" ] || die "Missing $VERSIONS_FILE"

# Tolerates CRLF line endings (Windows checkouts) and a missing final newline.
min_version() {
  local name value _
  while read -r name value _ || [ -n "$name" ]; do
    name="${name%$'\r'}"
    value="${value%$'\r'}"
    case "$name" in "" | \#*) continue ;; esac
    if [ "$name" = "$1" ]; then
      [[ $value =~ ^[0-9]+(\.[0-9]+)*$ ]] || die "Invalid minimum version '$value' for '$1' in $VERSIONS_FILE"
      printf '%s\n' "$value"
      return 0
    fi
  done < "$VERSIONS_FILE"
}

# Returns 0 when version $1 >= version $2 (compares major.minor.patch).
version_ge() {
  local IFS=.
  local -a have want
  have=($1)
  want=($2)
  local i x y
  for i in 0 1 2; do
    x="${have[i]:-0}"
    y="${want[i]:-0}"
    if ((10#$x > 10#$y)); then return 0; fi
    if ((10#$x < 10#$y)); then return 1; fi
  done
  return 0
}

# Runs a command and prints the first dotted version number in its output.
run_version() {
  command -v "$1" > /dev/null 2>&1 || return 1
  local out
  out="$("$@" 2>&1)" || return 1
  local pattern='([0-9]+(\.[0-9]+)+)'
  [[ $out =~ $pattern ]] || return 1
  printf '%s\n' "${BASH_REMATCH[1]}"
}

current_version() {
  case "$1" in
    git)
      # On macOS /usr/bin/git is a stub that opens an installer dialog
      # when the Command Line Tools are missing.
      if [ "$OS" = Darwin ] && [ "$(command -v git 2> /dev/null)" = /usr/bin/git ] \
        && ! xcode-select -p > /dev/null 2>&1; then
        return 1
      fi
      run_version git --version
      ;;
    uv) run_version uv --version ;;
    node) run_version node --version ;;
    python)
      command -v uv > /dev/null 2>&1 || return 1
      local py
      py="$(uv python find ">=$(min_version python)" 2> /dev/null)" || return 1
      run_version "$py" --version
      ;;
  esac
}

check_all() {
  MISSING=""
  local tool min ver
  for tool in $TOOLS; do
    min="$(min_version "$tool")"
    [ -n "$min" ] || die "No minimum version for '$tool' in $VERSIONS_FILE"
    if ver="$(current_version "$tool")" && [ -n "$ver" ]; then
      if version_ge "$ver" "$min"; then
        printf '  [OK]       %-7s %s (>= %s)\n' "$tool" "$ver" "$min"
      else
        printf '  [OUTDATED] %-7s %s (needs >= %s)\n' "$tool" "$ver" "$min"
        MISSING="$MISSING $tool"
      fi
    elif [ "$tool" != python ] && command -v "$tool" > /dev/null 2>&1; then
      printf '  [BROKEN]   %-7s installed but "%s --version" fails (needs >= %s)\n' "$tool" "$tool" "$min"
      MISSING="$MISSING $tool"
    else
      printf '  [MISSING]  %-7s (needs >= %s)\n' "$tool" "$min"
      MISSING="$MISSING $tool"
    fi
  done
}

# Makes tools installed by a previous run visible without reopening the terminal.
bootstrap_path() {
  case ":$PATH:" in *":$UV_BIN_DIR:"*) ;; *) PATH="$UV_BIN_DIR:$PATH" ;; esac
  if [ -x "$FNM_DIR/fnm" ]; then PATH="$FNM_DIR:$PATH"; fi
  export PATH
  if command -v fnm > /dev/null 2>&1; then
    eval "$(fnm env --shell bash)"
    fnm use default > /dev/null 2>&1 || true
  fi
}

detect_pm() {
  if [ "$OS" = Darwin ]; then
    if command -v brew > /dev/null 2>&1; then echo brew; else echo none; fi
    return
  fi
  local pm
  for pm in apt-get dnf yum pacman zypper; do
    if command -v "$pm" > /dev/null 2>&1; then echo "$pm"; return; fi
  done
  echo none
}

as_root() {
  if [ "$(id -u)" -eq 0 ]; then
    "$@"
  elif command -v sudo > /dev/null 2>&1; then
    sudo "$@"
  else
    die "Root privileges needed for: $* (install sudo or run as root)"
  fi
}

pm_install() {
  case "$PM" in
    apt-get)
      if [ "$APT_UPDATED" -eq 0 ]; then as_root apt-get update -qq; APT_UPDATED=1; fi
      as_root env DEBIAN_FRONTEND=noninteractive apt-get install -y -qq "$@"
      ;;
    dnf | yum) as_root "$PM" install -y -q "$@" ;;
    pacman)
      # Never run a full system upgrade on the user's behalf; a stale package
      # database is theirs to sync.
      as_root pacman -S --needed --noconfirm "$@" || {
        warn "pacman could not install: $*. If your package database is out of date, run 'sudo pacman -Syu' yourself and re-run this script."
        return 1
      }
      ;;
    zypper) as_root zypper --non-interactive install "$@" ;;
    brew) brew install "$@" ;;
    *) return 1 ;;
  esac
}

ensure_linux_packages() { # command:package pairs
  local pair cmd pkg
  for pair in "$@"; do
    cmd="${pair%%:*}"
    pkg="${pair#*:}"
    command -v "$cmd" > /dev/null 2>&1 && continue
    [ "$OS" = Linux ] || die "'$cmd' is required but not installed."
    pm_install "$pkg" || die "Could not install '$pkg' with $PM. Install it manually and re-run."
  done
}

install_git() {
  if [ "$OS" = Darwin ]; then
    if [ "$PM" = brew ]; then
      brew install git
    else
      xcode-select --install || true
      die "macOS is installing the Command Line Tools (includes git) in a separate window. Re-run this script when it finishes."
    fi
  else
    pm_install git || die "Could not install git with $PM. Install it manually and re-run."
  fi
}

install_uv() {
  if command -v uv > /dev/null 2>&1 && uv self update > /dev/null 2>&1; then
    return 0
  fi
  ensure_linux_packages curl:curl
  curl -LsSf https://astral.sh/uv/install.sh | sh
  bootstrap_path
  persist_shell_setup
}

install_python() {
  command -v uv > /dev/null 2>&1 || die "uv is required to install Python."
  uv python install "$(min_version python)"
}

# Official Node.js Linux builds link against libatomic, which minimal
# installs (containers, servers, some WSL images) do not ship.
ensure_libatomic() {
  [ "$OS" = Linux ] || return 0
  local libs
  libs="$({ ldconfig -p || /sbin/ldconfig -p; } 2> /dev/null || true)"
  case "$libs" in *libatomic.so.1*) return 0 ;; esac
  local pkg
  case "$PM" in
    apt-get | zypper) pkg=libatomic1 ;;
    dnf | yum) pkg=libatomic ;;
    pacman) pkg=gcc-libs ;;
    *) warn "Could not verify libatomic; if node fails to start, install libatomic for your distro."; return 0 ;;
  esac
  pm_install "$pkg" || die "Could not install '$pkg' (required by Node.js) with $PM."
}

install_node() {
  ensure_libatomic
  if ! command -v fnm > /dev/null 2>&1; then
    if [ "$OS" = Darwin ] && [ "$PM" = brew ]; then
      brew install fnm
    else
      ensure_linux_packages curl:curl unzip:unzip
      local extra=""
      if [ "$OS" = Darwin ]; then extra="--force-install"; fi
      curl -fsSL https://fnm.vercel.app/install | bash -s -- --install-dir "$FNM_DIR" --skip-shell $extra
    fi
    bootstrap_path
  fi
  command -v fnm > /dev/null 2>&1 || die "fnm was not found after installing it."
  fnm install --lts
  fnm default lts-latest
  fnm use lts-latest
  persist_shell_setup
}

# Writes one idempotent block that puts uv (~/.local/bin) and fnm's Node on
# PATH in new terminals. We own this instead of relying on each installer,
# because installers skip rc edits when the directory is already on PATH.
persist_shell_setup() {
  local shell_name rc
  shell_name="$(basename "${SHELL:-bash}")"
  case "$shell_name" in
    zsh) rc="$HOME/.zshrc" ;;
    bash)
      if [ "$OS" = Darwin ]; then
        # Login shells read ~/.bash_profile instead of ~/.profile when it exists;
        # do not create it, or ~/.profile would stop being read.
        if [ -f "$HOME/.bash_profile" ]; then rc="$HOME/.bash_profile"; else rc="$HOME/.profile"; fi
      else
        rc="$HOME/.bashrc"
      fi
      ;;
    *)
      warn "Your shell ($shell_name) is not configured automatically. Add $UV_BIN_DIR to PATH and set up fnm: https://github.com/Schniz/fnm#shell-setup"
      return 0
      ;;
  esac
  if [ -f "$rc" ]; then
    local line
    while IFS= read -r line || [ -n "$line" ]; do
      if [ "$line" = "$RC_BEGIN" ]; then return 0; fi
    done < "$rc"
  fi
  {
    printf '\n%s\n' "$RC_BEGIN"
    printf 'case ":$PATH:" in *":%s:"*) ;; *) export PATH="%s:$PATH" ;; esac\n' "$UV_BIN_DIR" "$UV_BIN_DIR"
    printf 'if [ -x "%s/fnm" ]; then export PATH="%s:$PATH"; fi\n' "$FNM_DIR" "$FNM_DIR"
    printf 'if command -v fnm >/dev/null 2>&1; then eval "$(fnm env --use-on-cd --shell %s)"; fi\n' "$shell_name"
    printf '%s\n' "$RC_END"
  } >> "$rc"
  info "Added the UX-AI toolchain block to $rc"
}

install_project_deps() {
  if [ -f "$REPO_ROOT/ml/pyproject.toml" ]; then
    info "Installing Python dependencies (ml/)..."
    (cd "$REPO_ROOT/ml" && uv sync)
  else
    info "  ml/pyproject.toml not found yet - skipping Python dependencies."
  fi
  if [ -f "$REPO_ROOT/web/package.json" ]; then
    info "Installing Node.js dependencies (web/)..."
    if [ -f "$REPO_ROOT/web/package-lock.json" ]; then
      (cd "$REPO_ROOT/web" && npm ci)
    else
      (cd "$REPO_ROOT/web" && npm install)
    fi
  else
    info "  web/package.json not found yet - skipping Node.js dependencies."
  fi
}

confirm() {
  [ "$ASSUME_YES" -eq 1 ] && return 0
  [ -t 0 ] || die "Not running interactively. Re-run with --yes to install."
  local answer
  printf '%s [y/N] ' "$1"
  read -r answer
  case "$answer" in y | Y | yes | YES | s | S | si | SI) return 0 ;; *) return 1 ;; esac
}

main() {
  bootstrap_path
  PM="$(detect_pm)"
  info "UX-AI setup - $OS (package manager: $PM)"
  info "Checking tools:"
  check_all

  if [ -n "$MISSING" ]; then
    if [ "$MODE" = check ]; then
      info "Missing or outdated:$MISSING"
      info "Run scripts/setup.sh to install them."
      exit 1
    fi
    if [ "$OS" = Linux ] && [ "$PM" = none ]; then
      warn "No supported package manager found (apt, dnf, yum, pacman, zypper); git, curl and unzip must be installed manually."
    fi
    confirm "Install or upgrade:$MISSING?" || die "Cancelled. Nothing was installed."
    local tool
    for tool in $MISSING; do
      info ""
      info "==> Installing $tool"
      "install_$tool"
    done
    info ""
    info "Re-checking tools:"
    check_all
    [ -z "$MISSING" ] || die "Still missing or outdated:$MISSING. See the messages above."
  else
    info "All tools are installed."
  fi

  [ "$MODE" = check ] && exit 0
  install_project_deps
  info ""
  info "Done. Open a new terminal so PATH changes take effect."
}

main
