import { ReorderIcon } from '../ui/icons';

interface AiNoticeProps {
  personaName: string;
  restored: boolean;
  onRestore: () => void;
  onUndoRestore: () => void;
}

export function AiNotice({ personaName, restored, onRestore, onUndoRestore }: AiNoticeProps) {
  return (
    <section className="ai-notice" aria-live="polite" aria-label="Aviso de personalización automática">
      <ReorderIcon className="ai-icon" size={18} />
      <div className="ai-text">
        <strong>
          {restored
            ? 'Vista predeterminada activa'
            : `Esta vista fue ordenada automáticamente para ${personaName}`}
        </strong>
        <p>
          {restored
            ? 'Mostramos la popularidad global de la tienda. Puedes recuperar tu vista personalizada cuando quieras.'
            : 'Un modelo de agrupamiento (K-Means) eligió las categorías y una tabla de reglas decidió el orden de las secciones. No es una recomendación humana.'}
        </p>
      </div>
      {restored ? (
        <button type="button" className="notice-button" onClick={onUndoRestore}>
          Volver a mi vista personalizada
        </button>
      ) : (
        <button type="button" className="notice-button" onClick={onRestore}>
          Restaurar vista predeterminada
        </button>
      )}
    </section>
  );
}
