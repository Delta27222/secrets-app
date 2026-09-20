import React from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableHead
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis
} from "@/components/ui/pagination";
import { format } from "date-fns";
import { Log } from "@/lib/api";
import { Search, Filter, X } from "lucide-react";

export type LogColumn = {
  key: keyof Log;
  label: string;
  render?: (value: any, log: Log) => React.ReactNode;
  className?: string;
};

interface LogsTableProps {
  title?: string;
  logs: Log[];
  loading?: boolean;
  columns: LogColumn[];
  showFilters?: boolean;
  pagination?: {
    currentPage: number;
    totalPages: number;
    total: number;
    perPage: number;
    onPageChange: (page: number) => void;
    onPerPageChange: (perPage: number) => void;
  };
}

function LogsTable({ title = 'Logs', logs, loading = false, columns, showFilters = true, pagination }: LogsTableProps) {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [userFilter, setUserFilter] = React.useState("all");
  const [actionFilter, setActionFilter] = React.useState("all");
  const [targetTypeFilter, setTargetTypeFilter] = React.useState("all");


  const tableColumns = columns;

  // Generar opciones de filtro automáticamente
  const uniqueUsers = React.useMemo(() => {
    const users = Array.from(new Set(logs?.map(log => {
      if (typeof log.user === 'string') {
        return log.user;
      }
      return log.user.displayName || log.user.email;
    })));
    return users.sort();
  }, [logs]);

  const uniqueActions = React.useMemo(() => {
    const actions = Array.from(new Set(logs?.map(log => log.action)));
    return actions.sort();
  }, [logs]);

  const uniqueTargetTypes = React.useMemo(() => {
    const targetTypes = Array.from(new Set(logs?.map(log => log.targetType)));
    return targetTypes.sort();
  }, [logs]);

  // Filtrar logs
  const filteredLogs = React.useMemo(() => {
    return logs?.filter(log => {
      const userDisplayName = typeof log.user === 'string' ? log.user : log.user.displayName || log.user.email;
      const userEmail = typeof log.user === 'string' ? '' : log.user.email || '';
      
      const matchesSearch = searchTerm === "" ||
        userDisplayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.idTarget.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesUser = userFilter === "all" || userDisplayName === userFilter;
      const matchesAction = actionFilter === "all" || log.action === actionFilter;
      const matchesTargetType = targetTypeFilter === "all" || log.targetType === targetTypeFilter;

      return matchesSearch && matchesUser && matchesAction && matchesTargetType;
    });
  }, [logs, searchTerm, userFilter, actionFilter, targetTypeFilter]);

  const clearFilters = () => {
    setSearchTerm("");
    setUserFilter("all");
    setActionFilter("all");
    setTargetTypeFilter("all");
  };

  const hasActiveFilters = searchTerm || userFilter !== "all" || actionFilter !== "all" || targetTypeFilter !== "all";

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p>Cargando logs...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">{title}</h3>
        <div className="flex items-center gap-2">
          <Badge variant="outline">{filteredLogs?.length} de {logs?.length} registros</Badge>
          {hasActiveFilters && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Filter className="h-3 w-3" />
              Filtros activos
            </Badge>
          )}
        </div>
      </div>

      {showFilters && (
        <div className="flex flex-wrap items-end gap-3 p-3 bg-muted/30 rounded-lg border">
          {/* Búsqueda general */}
          <div className="relative flex-1 min-w-[200px] space-y-2">
            <Label>Buscar</Label>
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar en logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 h-8 text-sm"
              />
            </div>
          </div>

          {/* Filtro por usuario */}
          <div className="space-y-2">
            <Label>Usuario</Label>
            <Select value={userFilter} onValueChange={setUserFilter}>
              <SelectTrigger className="w-[140px] h-8 text-sm">
                <SelectValue placeholder="Usuario" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {uniqueUsers.map(user => (
                  <SelectItem key={user} value={user}>{user}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filtro por acción */}
          <div className="space-y-2">
            <Label>Acción</Label>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-[160px] h-8 text-sm">
                <SelectValue placeholder="Acción">
                  {actionFilter === "all" ? (
                    <p>Todos</p>
                  ) : (
                    <Badge
                      variant={actionFilter as any}
                      className="text-xs px-2 py-0.5"
                    >
                      {actionFilter}
                    </Badge>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs px-2 py-0.5">
                    Todas las acciones
                  </Badge>
                </SelectItem>
                {uniqueActions.map(action => (
                  <SelectItem key={action} value={action} className="flex items-center gap-2">
                    <Badge
                      variant={action as any}
                      className="text-xs px-2 py-0.5"
                    >
                      {action}
                    </Badge>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filtro por tipo de target */}
          <div className="space-y-2">
            <Label>Tipo</Label>
            <Select value={targetTypeFilter} onValueChange={setTargetTypeFilter}>
              <SelectTrigger className="w-[140px] h-8 text-sm">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {uniqueTargetTypes.map(targetType => (
                  <SelectItem key={targetType} value={targetType}>{targetType}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Botón limpiar */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
            >
              <X className="h-3 w-3 mr-1" />
              Limpiar
            </Button>
          )}
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {tableColumns.map((column) => (
                <TableHead key={column.key}>{column.label}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLogs?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={tableColumns.length} className="text-center py-8 text-muted-foreground">
                  {logs.length === 0 ? "No hay logs disponibles" : "No se encontraron logs con los filtros aplicados"}
                </TableCell>
              </TableRow>
            ) : (
              filteredLogs?.map((log) => (
                <TableRow key={log.id}>
                  {tableColumns.map((column) => {
                    const value = log[column.key];
                    const content = column.render ? column.render(value, log) : value;
                    return (
                      <TableCell key={column.key} className={column.className}>
                        {content as React.ReactNode}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      {pagination ? (
        <div className="border-t bg-slate-50/50 backdrop-blur-sm rounded-b-lg">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 px-6 py-4">
            {/* Left side - Info and per page selector */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 min-w-0 flex-1">
              <div className="text-sm text-slate-600 whitespace-nowrap">
                <span className="font-semibold text-slate-900">
                  {((pagination.currentPage - 1) * pagination.perPage) + 1}-{Math.min(pagination.currentPage * pagination.perPage, pagination.total)}
                </span>
                <span className="mx-1">de</span>
                <span className="font-semibold text-slate-900">{pagination.total}</span>
                <span className="ml-1">registros</span>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <Label htmlFor="per-page" className="text-sm font-medium text-slate-700 whitespace-nowrap">
                  Mostrar:
                </Label>
                <Select
                  value={pagination.perPage.toString()}
                  onValueChange={(value) => pagination.onPerPageChange(parseInt(value))}
                >
                  <SelectTrigger className="w-[85px] h-9 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-slate-200 shadow-lg">
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Right side - Pagination controls */}
            <div className="flex items-center justify-center lg:justify-end flex-shrink-0">
              <Pagination>
                <PaginationContent className="gap-1">
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (pagination.currentPage > 1) {
                          pagination.onPageChange(pagination.currentPage - 1);
                        }
                      }}
                      className={`h-9 px-3 text-sm font-medium transition-all duration-200 ${
                        pagination.currentPage <= 1 
                          ? "pointer-events-none opacity-40 text-slate-400" 
                          : "text-slate-700 hover:text-blue-600 hover:bg-blue-50"
                      }`}
                    />
                  </PaginationItem>

                  {/* First page */}
                  {pagination.currentPage > 3 && pagination.totalPages > 5 && (
                    <>
                      <PaginationItem>
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            pagination.onPageChange(1);
                          }}
                          className="h-9 w-9 text-sm font-medium text-slate-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
                        >
                          1
                        </PaginationLink>
                      </PaginationItem>
                      {pagination.currentPage > 4 && (
                        <PaginationItem>
                          <PaginationEllipsis className="h-9 w-9 flex items-center justify-center text-slate-400" />
                        </PaginationItem>
                      )}
                    </>
                  )}

                  {/* Page numbers around current page */}
                  {Array.from({ length: Math.min(3, pagination.totalPages) }, (_, i) => {
                    let pageNumber;
                    if (pagination.totalPages <= 5) {
                      pageNumber = i + 1;
                    } else if (pagination.currentPage <= 3) {
                      pageNumber = i + 1;
                    } else if (pagination.currentPage >= pagination.totalPages - 2) {
                      pageNumber = pagination.totalPages - 2 + i;
                    } else {
                      pageNumber = pagination.currentPage - 1 + i;
                    }

                    if (pageNumber < 1 || pageNumber > pagination.totalPages) return null;

                    const isActive = pageNumber === pagination.currentPage;

                    return (
                      <PaginationItem key={pageNumber}>
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            pagination.onPageChange(pageNumber);
                          }}
                          isActive={isActive}
                          className={`h-9 w-9 text-sm font-medium transition-all duration-200 ${
                            isActive
                              ? "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
                              : "text-slate-700 hover:text-blue-600 hover:bg-blue-50"
                          }`}
                        >
                          {pageNumber}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}

                  {/* Last page */}
                  {pagination.currentPage < pagination.totalPages - 2 && pagination.totalPages > 5 && (
                    <>
                      {pagination.currentPage < pagination.totalPages - 3 && (
                        <PaginationItem>
                          <PaginationEllipsis className="h-9 w-9 flex items-center justify-center text-slate-400" />
                        </PaginationItem>
                      )}
                      <PaginationItem>
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            pagination.onPageChange(pagination.totalPages);
                          }}
                          className="h-9 w-9 text-sm font-medium text-slate-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
                        >
                          {pagination.totalPages}
                        </PaginationLink>
                      </PaginationItem>
                    </>
                  )}

                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (pagination.currentPage < pagination.totalPages) {
                          pagination.onPageChange(pagination.currentPage + 1);
                        }
                      }}
                      className={`h-9 px-3 text-sm font-medium transition-all duration-200 ${
                        pagination.currentPage >= pagination.totalPages 
                          ? "pointer-events-none opacity-40 text-slate-400" 
                          : "text-slate-700 hover:text-blue-600 hover:bg-blue-50"
                      }`}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default LogsTable;