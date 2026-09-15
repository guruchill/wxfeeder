import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

function extractText(result) {
  return (result.content || []).map((c) => c.text || "").join(" ");
}

export async function withPilcrowClient(config, fn) {
  const transport = new StreamableHTTPClientTransport(new URL(config.mcpUrl), {
    requestInit: { headers: { Authorization: `Bearer ${config.apiKey}` } },
  });
  const client = new Client({ name: "wxfeeder", version: "1.0.0" });
  await client.connect(transport);
  try {
    return await fn(client);
  } finally {
    await client.close();
  }
}

export async function updateSnippet(client, id, markdownSource) {
  const result = await client.callTool({ name: "update_snippet", arguments: { id, markdownSource } });
  if (result.isError) throw new Error(`update_snippet failed: ${extractText(result)}`);
  return result;
}

export async function setManualLightUp(client, snippetId, color) {
  const result = await client.callTool({ name: "set_manual_light_up", arguments: { snippetId, color } });
  if (result.isError) throw new Error(`set_manual_light_up failed: ${extractText(result)}`);
  return result;
}
