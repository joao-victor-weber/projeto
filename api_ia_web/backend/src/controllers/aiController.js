import { sendMessageToAi } from "../services/aiService.js";
export function listAis(req,res){
    const ais =[{
        id: "gemini",
        name: "Gemini",
        description: "IA do Google para conversas, explicações e geração de texto"
    },
    {
      id: "openai",
      name: "OpenAI",
      description: "IA para conversas, programação, escrita e raciocínio."
    },
    {
      id: "claude",
      name: "Claude",
      description: "IA focada em conversas longas, análise de texto e produtividade."
    }
];
return res.json({
    total: ais.length,
    data: ais
});
}
export async function chatWithAi(req,res){
    try{
        const {aiId}= req.params;
        const { message } = req.body;
        const result = await sendMessageToAi(aiId, message);
        return res.json({
            success: true,
            data: result
        });
    }catch(error){
        return res.status(error.statusCode||500).json({
            success: false,
            error: error.message||"Erro interno no servidor"
        })
    }
}