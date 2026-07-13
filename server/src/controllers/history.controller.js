import historyService from "../services/history.service.js";

export const getHistory = async (req, res) => {
  try {
    const { fileId } = req.params;
    const history = await historyService.listHistory(fileId, req.user.id);
    res.json({ history });
  } catch (error) {
    console.error(error);
    const status = error.status || 500;
    res.status(status).json({ message: error.message });
  }
};

export const restoreHistory = async (req, res) => {
  try {
    const { historyId } = req.params;
    const file = await historyService.restoreVersion(historyId, req.user.id);
    res.json({ message: "Version restored successfully", file });
  } catch (error) {
    console.error(error);
    const status = error.status || 500;
    res.status(status).json({ message: error.message });
  }
};

export const deleteHistory = async (req, res) => {
  try {
    const { historyId } = req.params;
    await historyService.deleteHistory(historyId, req.user.id);
    res.json({ message: "History record deleted successfully" });
  } catch (error) {
    console.error(error);
    const status = error.status || 500;
    res.status(status).json({ message: error.message });
  }
};
