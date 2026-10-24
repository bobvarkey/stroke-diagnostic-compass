import { useEffect, useState } from "react";
import { Bot, Check, Eye, EyeOff, ExternalLink, KeyRound, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  AI_PROVIDERS,
  PROVIDER_ORDER,
  clearAiSettings,
  defaultModel,
  describeAiError,
  getAiSettings,
  listAiModels,
  setAiSettings,
  testAiConnection,
  type AiProviderId,
} from "@/lib/aiProviders";

type TestStatus = { kind: "ok" | "error"; text: string } | null;

export default function AiSettingsCard() {
  const saved = getAiSettings();
  const [open, setOpen] = useState(false);
  const [provider, setProvider] = useState<AiProviderId>(saved?.provider ?? "openai");
  const [apiKey, setApiKey] = useState(saved?.apiKey ?? "");
  const [model, setModel] = useState(saved?.model ?? defaultModel("openai"));
  const [models, setModels] = useState<string[]>(AI_PROVIDERS.openai.models);
  const [saveLocally, setSaveLocally] = useState(saved?.saveLocally ?? false);
  const [showKey, setShowKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [loadingModels, setLoadingModels] = useState(false);
  const [status, setStatus] = useState<TestStatus>(null);
  const [configured, setConfigured] = useState(Boolean(saved));

  // Re-read on open: another tab or a sign-out may have changed it.
  useEffect(() => {
    if (!open) return;
    const current = getAiSettings();
    const nextProvider = current?.provider ?? "openai";
    setProvider(nextProvider);
    setApiKey(current?.apiKey ?? "");
    setModel(current?.model ?? defaultModel(nextProvider));
    setModels(AI_PROVIDERS[nextProvider].models);
    setSaveLocally(current?.saveLocally ?? false);
    setStatus(null);
    setShowKey(false);
  }, [open]);

  const info = AI_PROVIDERS[provider];

  const save = () => {
    if (!apiKey.trim()) {
      setStatus({ kind: "error", text: "Paste an API key first." });
      return;
    }
    setAiSettings({
      provider,
      apiKey: apiKey.trim(),
      model: model.trim() || defaultModel(provider),
      saveLocally,
    });
    setConfigured(true);
    toast.success("AI settings saved", {
      description: saveLocally
        ? "The key is stored in this browser only."
        : "The key is kept in memory for this tab only.",
    });
    setOpen(false);
  };

  const remove = () => {
    clearAiSettings();
    setConfigured(false);
    setApiKey("");
    setSaveLocally(false);
    setStatus(null);
    toast.success("API key removed from this device");
  };

  const test = async () => {
    if (!apiKey.trim()) {
      setStatus({ kind: "error", text: "Paste an API key first." });
      return;
    }
    setTesting(true);
    setStatus(null);
    try {
      await testAiConnection(provider, apiKey.trim());
      setStatus({ kind: "ok", text: `Connection works — ${info.label} accepted this key.` });
    } catch (error) {
      setStatus({ kind: "error", text: describeAiError(error) });
    } finally {
      setTesting(false);
    }
  };

  const changeProvider = (next: AiProviderId) => {
    setProvider(next);
    setApiKey("");
    setModel(defaultModel(next));
    setModels(AI_PROVIDERS[next].models);
    setStatus(null);
  };

  const loadModels = async () => {
    if (!apiKey.trim()) {
      setStatus({ kind: "error", text: "Paste an API key first, then load its models." });
      return;
    }
    setLoadingModels(true);
    setStatus(null);
    try {
      const list = await listAiModels(provider, apiKey.trim());
      if (list.length > 0) {
        setModels(list);
        if (!list.includes(model)) setModel(list[0]);
        setStatus({ kind: "ok", text: `Loaded ${list.length} models from ${info.label}.` });
      } else {
        setStatus({ kind: "error", text: `${info.label} returned no chat models; keeping the fallback list.` });
      }
    } catch (error) {
      setStatus({ kind: "error", text: describeAiError(error) });
    } finally {
      setLoadingModels(false);
    }
  };

  return (
    <section className="glass rounded-xl p-4 space-y-3">
      <h2 className="font-semibold flex items-center gap-2">
        <Bot className="h-4 w-4" /> AI settings
      </h2>
      <p className="text-sm text-muted-foreground">
        {configured && saved
          ? `AI features use your own ${AI_PROVIDERS[saved.provider].label} key (${saved.model}). Provider usage is billed to your account.`
          : "AI features use the app's built-in analysis. You can bring your own provider key and pay the provider directly instead."}
      </p>
      <div className="flex flex-wrap gap-2">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="min-h-11">
              <KeyRound className="h-4 w-4 mr-1" /> Configure AI provider
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Bring your own API key</DialogTitle>
              <DialogDescription>
                Your key is sent directly from this browser to the provider you choose. It never
                reaches this app's servers.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="ai-provider">Provider</Label>
                <Select value={provider} onValueChange={(value) => changeProvider(value as AiProviderId)}>
                  <SelectTrigger id="ai-provider" className="min-h-11">
                    <SelectValue placeholder="Choose a provider" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROVIDER_ORDER.map((id) => (
                      <SelectItem key={id} value={id}>
                        {AI_PROVIDERS[id].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="ai-key">API key</Label>
                <div className="relative">
                  <Input
                    id="ai-key"
                    type={showKey ? "text" : "password"}
                    value={apiKey}
                    onChange={(event) => {
                      setApiKey(event.target.value);
                      setStatus(null);
                    }}
                    placeholder={info.placeholder}
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck={false}
                    className="min-h-11 pr-11 font-mono text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey((value) => !value)}
                    className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted-foreground hover:text-foreground"
                    aria-label={showKey ? "Hide API key" : "Show API key"}
                  >
                    {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <a
                  href={info.docsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-primary underline underline-offset-2"
                >
                  {info.helpLabel}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <Label htmlFor="ai-model">Model</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={loadModels}
                    disabled={loadingModels}
                  >
                    {loadingModels ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : null}
                    {loadingModels ? "Loading…" : "Load models"}
                  </Button>
                </div>
                <Input
                  id="ai-model"
                  list="ai-model-options"
                  value={model}
                  onChange={(event) => {
                    setModel(event.target.value);
                    setStatus(null);
                  }}
                  placeholder={info.models[0]}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  className="min-h-11 font-mono text-sm"
                />
                <datalist id="ai-model-options">
                  {models.map((name) => (
                    <option key={name} value={name} />
                  ))}
                </datalist>
                <p className="text-xs text-muted-foreground">
                  Pick a suggestion, load the provider's list, or type any model identifier the key can use.
                </p>
              </div>

              <div className="flex items-start justify-between gap-4 rounded-lg border p-3">
                <div className="space-y-1">
                  <Label htmlFor="ai-save" className="cursor-pointer">Save key locally</Label>
                  <p className="text-xs text-muted-foreground">
                    {saveLocally
                      ? "Stored in this browser's localStorage so it survives reloads. Anyone with access to this browser profile can read it."
                      : "Kept in memory for this tab only and forgotten when you close it."}
                  </p>
                </div>
                <Switch id="ai-save" checked={saveLocally} onCheckedChange={setSaveLocally} />
              </div>

              {status && (
                <p
                  className={`flex items-start gap-2 rounded-lg p-3 text-sm ${
                    status.kind === "ok"
                      ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300"
                      : "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300"
                  }`}
                >
                  {status.kind === "ok" ? <Check className="mt-0.5 h-4 w-4 shrink-0" /> : <KeyRound className="mt-0.5 h-4 w-4 shrink-0" />}
                  {status.text}
                </p>
              )}
            </div>

            <DialogFooter className="flex-col gap-2 sm:flex-row">
              <Button type="button" variant="outline" className="min-h-11" onClick={test} disabled={testing}>
                {testing ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : null}
                {testing ? "Testing…" : "Test connection"}
              </Button>
              <Button type="button" className="min-h-11" onClick={save} disabled={!apiKey.trim()}>
                Save key
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {configured && (
          <Button variant="ghost" className="min-h-11" onClick={remove}>
            <Trash2 className="h-4 w-4 mr-1" /> Remove key
          </Button>
        )}
      </div>
    </section>
  );
}
