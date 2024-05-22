import { AppError } from "@/Helpers/AppError";
import messages from "@/Helpers/messages";
import { type Request } from "express";
import multer from "multer";
import { v4 } from "uuid";

const saveFile = async (req: Request, file: any, next: any) => {
  const ext = file.originalname.split(".");
  const newFileName = `${v4()}.${ext[ext.length - 1]}`;

  req.body[file.fieldname] = newFileName;

  next(null, newFileName);
};

const prepareDestination = (req: Request, file: any, next: any) => {
  if (file.fieldname === "image") {
    next(null, "./protected/images/");
  }

  if (file.fieldname === "file") {
    next(null, "./protected/assets/");
  }
  if (file.fieldname === "icon") {
    next(null, "./protected/games/");
  }
  if (file.fieldname === "flag") {
    next(null, "./protected/games/flags/");
  }

  if (file.fieldname === "categoryImage") {
    next(null, "./protected/games/categories/");
  }
};

// filter file extension
const filterFileType = (req: Request, file: any, next: any) => {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/jpg",
    "application/octet-stream",
  ];
  if (allowedTypes.includes(file.mimetype)) {
    next(null, true);
  } else {
    return next(new AppError(messages.ERR_FILE, 400), false);
  }
};

const storage = multer.diskStorage({
  destination: prepareDestination,
  filename: saveFile,
});

const uploader = multer({
  storage,
  limits: {
    fileSize: 1024 * 1024 * 2,
  },
  fileFilter: filterFileType,
  preservePath: true,
});

export default uploader.fields([
  { name: "image", maxCount: 1 },
  { name: "file", maxCount: 1 },
  { name: "icon", maxCount: 1 },
  { name: "flag", maxCount: 1 },
  { name: "categoryImage", maxCount: 1 },
]);
