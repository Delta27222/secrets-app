import { Badge } from "@/components/ui/badge";
import { Log } from "@/lib/api";
import { LogColumn } from "../Logs/LogsTable";

/**
 * Columnas para el tab de errores. Se apartan de las de info porque las preguntas
 * son otras: ahí interesa qué se hizo, aquí qué falló, con qué código y desde dónde.
 * `idTarget` y `execution_time` se omiten — en un fallo HTTP van vacíos o en cero.
 */
export const errorLogsColumns: LogColumn[] = [
  {
    key: 'user',
    label: 'Usuario',
    render: (value: string | { id: string; email: string; displayName: string }) => {
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
    key: 'status_code',
    label: 'Código',
    render: (value?: number) => {
      if (value === undefined || value === null) return <span className="text-muted-foreground">—</span>;
      // 5xx es fallo del servidor; 4xx es petición rechazada. Distinto color porque
      // requieren acciones distintas: uno se investiga, el otro se audita.
      const esServidor = value >= 500;
      return (
        <Badge variant={esServidor ? "destructive" : "secondary"} className="font-mono">
          {value}
        </Badge>
      );
    }
  },
  {
    key: 'method',
    label: 'Método',
    className: 'font-mono text-xs',
    render: (value?: string) => value ?? <span className="text-muted-foreground">—</span>
  },
  {
    key: 'details',
    label: 'Ruta',
    className: 'max-w-[220px] truncate font-mono text-xs',
    render: (value: string) => <span title={value}>{value}</span>
  },
  {
    key: 'error_message',
    label: 'Motivo',
    className: 'max-w-xs truncate',
    render: (value: string | undefined, log: Log) => {
      // Las filas anteriores al cambio de esquema no tienen motivo guardado.
      if (!value) return <span className="text-muted-foreground">Sin detalle</span>;
      return (
        <span title={log.error_type ? `${log.error_type}: ${value}` : value}>
          {value}
        </span>
      );
    }
  },
  {
    key: 'client_ip',
    label: 'Origen',
    className: 'font-mono text-xs',
    render: (value?: string) => value ?? <span className="text-muted-foreground">—</span>
  },
  {
    key: 'date',
    label: 'Fecha',
    render: (value: string) => {
      try {
        return new Date(value).toLocaleString('es-ES', {
          day: '2-digit', month: '2-digit', year: 'numeric',
          hour: '2-digit', minute: '2-digit', second: '2-digit'
        });
      } catch {
        return value;
      }
    }
  }
];
