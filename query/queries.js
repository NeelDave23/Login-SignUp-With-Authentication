const addData = `INSERT INTO usersforMD5 (name,email,password_md5,password_bcrypt) VALUES ($1,$2,$3,$4)`;
const dataFromEmail = `SELECT * FROM usersforMD5 WHERE email=$1`;
const dataFromId = `SELECT * FROM usersforMD5 WHERE id=$1`;
const updatePass = `UPDATE usersforMD5 SET password_md5 = $1 WHERE id = $2`;
module.exports = { addData, dataFromEmail, dataFromId, updatePass };
