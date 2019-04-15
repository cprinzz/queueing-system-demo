import express from "express";
import db from "../Database";
import { ERROR, SUCCESS } from "../constants";
const deleteMessage = express.Router();

/* DELETE /deleteMessage
    summary: Deletes message in DB with messageId
    parameters: {id: string}
    responses:
      200: {status: string, msg: string}
      400: {status: string, msg: string}
*/

deleteMessage.delete("/", (req, res) => {
  const deleteId = req.body.id;
  if (!deleteId) {
    res
      .status(400)
      .json({ status: ERROR, msg: "Request body must include parameter: id" });
  }

  db.deleteMessage(deleteId);
  res.json({ status: SUCCESS, msg: `${deleteId} deleted.` });
});

export default deleteMessage;
