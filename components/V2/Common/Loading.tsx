

export function Loading({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>{message ? message : "Cargando..."}</p>
        </div>
      </div>
  );
}
