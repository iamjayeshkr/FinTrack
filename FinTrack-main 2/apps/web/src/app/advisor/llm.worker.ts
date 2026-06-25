import { pipeline, env } from "@xenova/transformers";

// Disable local models checking since we want remote HF models downloaded via CDN
env.allowLocalModels = false;

// Fix for environments where self is not fully typed as a worker
const ctx: Worker = self as any;

class LLMPipeline {
  static task = "text-generation";
  static model = "Xenova/Qwen1.5-0.5B-Chat";
  static instance: any = null;

  static async getInstance(progress_callback?: Function) {
    if (this.instance === null) {
      this.instance = await pipeline(this.task as any, this.model, { 
        progress_callback 
      });
    }
    return this.instance;
  }
}

// Listen for messages from the main thread
ctx.addEventListener("message", async (event) => {
  const { type, data } = event.data;

  if (type === "load") {
    try {
      await LLMPipeline.getInstance((progressData: any) => {
        if (progressData.status === "progress") {
          ctx.postMessage({
            type: "progress",
            data: {
              file: progressData.file,
              progress: progressData.progress,
              loaded: progressData.loaded,
              total: progressData.total,
            }
          });
        }
      });
      ctx.postMessage({ type: "ready" });
    } catch (error: any) {
      console.error("[LLM Worker] Model load error:", error);
      ctx.postMessage({ type: "error", error: error.message || String(error) });
    }
  }

  if (type === "generate") {
    const { prompt } = data;
    try {
      const generator = await LLMPipeline.getInstance();
      
      // Construct a ChatML prompt for Qwen
      const chatMLPrompt = `<|im_start|>system
You are a Principal Financial Advisor. Synthesize the user's financial details and knowledge base contexts to generate actionable advice.
You MUST format your output exactly as:
DO: [Action item 1]
DO: [Action item 2]
DO: [Action item 3]
DONT: [Avoid item 1]
DONT: [Avoid item 2]
DONT: [Avoid item 3]
SUMMARY: [Short assessment]
<|im_end|>
<|im_start|>user
${prompt}
<|im_end|>
<|im_start|>assistant
`;

      const response = await generator(chatMLPrompt, {
        max_new_tokens: 256,
        temperature: 0.1,
        repetition_penalty: 1.2,
        do_sample: false,
        return_full_text: false,
      });

      const text = response[0]?.generated_text || "";
      ctx.postMessage({
        type: "result",
        data: text
      });
    } catch (error: any) {
      console.error("[LLM Worker] Inference error:", error);
      ctx.postMessage({ type: "error", error: error.message || String(error) });
    }
  }
});
