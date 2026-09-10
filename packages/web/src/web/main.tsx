// Entry point referenced by index.html — composition only, real bootstrap
// lives in __main.tsx (template-managed).
import { authClient } from "./lib/auth";
import "./__main";

// Finaliza o login gerenciado (Google) quando a página volta do redirect.
// O plugin atualiza a sessão reativa sozinho quando resolve.
void authClient.managedAuth.handleRedirect();
