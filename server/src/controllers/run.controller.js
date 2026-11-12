import { runCode } from "../services/codeRunner.js";

export const executeCode = async (req, res) => {
  try {
    const { language, code } = req.body;

    if (!language || !code) {
      return res.status(400).json({
        message: "Language and code are required",
      });
    }

    const result = await runCode({
      language,
      code,
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
