import { AIConfig, Message } from '../store/useAIStore';

export async function fetchModels(baseUrl: string, apiKey: string): Promise<string[]> {
  try {
    // Normalize Base URL (remove trailing slash)
    const url = baseUrl.replace(/\/$/, '');
    // Try standard OpenAI models endpoint
    const response = await fetch(`${url}/models`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch models: ${response.statusText}`);
    }

    const data = await response.json();
    // OpenAI format: { data: [{ id: 'model-name', ... }] }
    if (data.data && Array.isArray(data.data)) {
        return data.data.map((m: any) => m.id);
    }
    return [];
  } catch (error) {
    console.error("Error fetching models:", error);
    return [];
  }
}

export async function streamChatCompletion(
  config: AIConfig,
  messages: { role: string; content: string }[],
  onChunk: (content: string) => void,
  onFinish: () => void,
  onError: (error: any) => void,
  signal?: AbortSignal
) {
  try {
    const url = config.baseUrl.replace(/\/$/, '');
    
    // Create a timeout controller for Time-To-First-Byte (3 minutes)
    const timeoutController = new AbortController();
    const timeoutId = setTimeout(() => {
        timeoutController.abort(new Error('请求超时 (超过3分钟未收到响应)。这通常是因为 API 代理商拦截了过大的请求，或者模型处理时间过长。'));
    }, 3 * 60 * 1000);

    // Combine signals
    const onAbort = () => timeoutController.abort();
    if (signal) {
        signal.addEventListener('abort', onAbort);
    }

    const response = await fetch(`${url}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: config.model,
        messages: messages,
        stream: true
      }),
      signal: timeoutController.signal
    });

    // Clear TTFB timeout once we get the headers
    clearTimeout(timeoutId);
    if (signal) {
        signal.removeEventListener('abort', onAbort);
    }

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    if (!response.body) throw new Error("No response body");

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith("data: ")) {
          const dataStr = trimmed.slice(6);
          if (dataStr === "[DONE]") {
             continue;
          }
          try {
            const data = JSON.parse(dataStr);
            const content = data.choices?.[0]?.delta?.content || "";
            if (content) {
              onChunk(content);
            }
          } catch (e) {
            // Ignore parse errors for partial chunks
          }
        }
      }
    }
    
    onFinish();

  } catch (error) {
    onError(error);
  }
}
