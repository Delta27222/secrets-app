import { Badge } from "@/components/ui/badge";
import { LogColumn } from "../Logs/LogsTable";

export const defaultLogsColumns: LogColumn[] = [
  {
    key: 'user',
    label: 'Usuario',
    render: (value: string | { _id: string; email: string; displayName: string }) => {
      if (typeof value === 'string') {
        return <span className="text-muted-foreground">{value}</span>;
      }

      return (
        <div className="flex flex-col text-[10px]">
          <span className="font-medium">{value.displayName}</span>
          <span className="text-muted-foreground">{value.email}</span>
        </div>
      );
    }
  },
  {
    key: 'action',
    label: 'Acción',
    render: (value: string) => {
      return (
        <Badge variant={value as any}>
          {value}
        </Badge>
      );
    }
  },
  {
    key: 'date',
    label: 'Fecha',
    render: (value: string) => {
      try {
        return new Date(value).toLocaleString('es-ES', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        });
      } catch {
        return value;
      }
    }
  },
  {
    key: 'idTarget',
    label: 'ID Target',
    className: 'font-mono text-sm'
  },
  {
    key: 'details',
    label: 'Detalles',
    className: 'max-w-xs truncate',
    render: (value: string) => (
      <span title={value}>{value}</span>
    )
  },
  {
    key: 'execution_time',
    label: 'Tiempo de Ejecución',
    render: (value: string) => {
      try {
        // Convertir a número y formatear con 2 decimales
        const timeInSeconds = parseFloat(value);
        if (isNaN(timeInSeconds)) return value;
        return `${timeInSeconds.toFixed(2)}s`;
      } catch {
        return value;
      }
    }
  }
];