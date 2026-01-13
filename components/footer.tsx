export function Footer() {
  return (
    <footer className="border-t bg-card mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="text-center text-sm text-muted-foreground">
          Built by{" "}
          <a 
            href="https://github.com/abhijitkrm" 
            target="_blank" 
            rel="noopener noreferrer"
            className="font-medium hover:text-foreground transition-colors"
          >
            Abhijit
          </a>
        </div>
      </div>
    </footer>
  );
}
