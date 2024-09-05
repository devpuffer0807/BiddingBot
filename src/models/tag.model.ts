import mongoose, { Schema } from "mongoose";

interface ITag extends Document {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  name: string;
  color: string;
}

const TagSchema = new Schema<ITag>({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  color: { type: String, required: true },
});

const Tag =
  (mongoose.models.Tag as mongoose.Model<ITag>) ||
  mongoose.model<ITag>("Tag", TagSchema);
export default Tag;
