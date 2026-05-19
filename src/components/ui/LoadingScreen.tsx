export function LoadingScreen({ message = 'Загрузка...' }: { message?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center text-zinc-500">
      {message}
    </div>
  );
}
