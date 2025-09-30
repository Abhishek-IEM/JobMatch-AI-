const ResumeModel = require("../Models/resume");
const multer = require("multer");
const pdfParse = require("pdf-parse");
const path = require("path");
const { CohereClient } = require("cohere-ai");
const { create } = require("../Models/user");

const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY,
});

exports.addResume = async (req, res) => {
  try {
    const { job_desc, user } = req.body;

    // console.log(req.file);
    // console.log(job_desc, user);

    const pdfBuffer = req.file.buffer || null;
    const pdfPath = req.file.path;

    const fs = require("fs");
    const dataBuffer = fs.readFileSync(pdfPath);
    const pdfData = await pdfParse(dataBuffer);

    const prompt = `
            You are a resume screening assistant.
            Compare the following resume text with the provided Job Description (JD) and give a match score (0-100) and feedback.

            Resume:
            ${pdfData.text}

            Job Description:
            ${job_desc}

            Return the score and a brief explanation in this format:
            Score: XX
            Reason: ...

            `;
    const response = await cohere.chat({
      model: "command-a-03-2025",
      message: prompt,
      max_tokens: 120,
      temperature: 0.7,
    });

    let result = response.text;
    //console.log(result);

    const match = result.match(/Score:\s*(\d+)/);
    const score = match ? parseInt(match[1], 10) : null;

    const reasonMatch = result.match(/Reason:\s*([\s\S]*)/);
    const reason = reasonMatch ? reasonMatch[1].trim() : null;

    const newResume = new ResumeModel({
      user,
      resume_name: req.file.originalname,
      job_desc,
      score,
      feedback: reason,
    });

    await newResume.save();

    fs.unlinkSync(pdfPath);

    res
      .status(200)
      .json({ message: "Your analysis are ready", data: newResume });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server error", message: err.message });
  }
};

exports.getAllResumesForUser = async (req, res) => {
  try {
    const { user } = req.params;
    let resumes = await ResumeModel.find({ user }).sort({ createdAt: -1 });
    res
      .status(200)
      .json({ message: "Your Previous History", resumes: resumes });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server error", message: err.message });
  }
};

exports.getResumeForAdmin = async (req, res) => {
  try {
    let resumes = await ResumeModel.find({})
      .sort({ createdAt: -1 })
      .populate("user");
    res.status(200).json({ message: "Fetched All History", resumes: resumes });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ error: "Server error", message: err.message });
  }
};
