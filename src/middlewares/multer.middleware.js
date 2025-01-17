import multer from "multer";

//copied from multer github
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); //we are not going advance just saving whatever the file name is given
    // const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    // cb(null, file.fieldname + '-' + uniqueSuffix) //giving our file its name (random) using callback;
  },
});

export const upload = multer({ storage });
