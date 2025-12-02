export const uploadFile = (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }


    res.status(200).json({
      message: "File uploaded successfully",
      filePath: req.file.path, 
      fileName: req.file.filename,
      type: req.file.mimetype.startsWith("image") ? "image" : "video",
    });
  } catch (error) {
    console.error("Upload Error:", error);
    res.status(500).json({ message: "Server error during file upload" });
  }
};