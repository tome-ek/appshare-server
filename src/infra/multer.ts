import multer from 'multer';
export default multer({
  storage: multer.diskStorage({
    destination: (_req, _file, callback) => callback(null, './tmp'),
    filename: (_req, _file, callback) => callback(null, `${Date.now()}.zip`),
  }),
});
