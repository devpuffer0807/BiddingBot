import mongoose, { Document, Schema } from "mongoose";
interface IUser extends Document {
  _id: string;
  name: string;
  email: string;
  password: string;
  signupForUpdates: boolean;
  isVerified: boolean;
}

const userSchema: Schema<IUser> = new Schema(
  {
    _id: { type: String, required: true },
    name: { type: String },
    email: { type: String, unique: true },
    password: { type: String, required: true },
    signupForUpdates: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true, _id: false }
);

const User =
  (mongoose.models.User as mongoose.Model<IUser>) ||
  mongoose.model<IUser>("User", userSchema);

export { User };
