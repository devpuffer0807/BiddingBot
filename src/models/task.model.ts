import mongoose, { Schema } from "mongoose";

interface ITask extends Document {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  slug: string;
  selectedWallet: string;
  walletPrivateKey: string;
  minFloorPricePercentage: string;
  maxFloorPricePercentage: string;
  selectedMarketplaces: string[];
  running: boolean;
  contractAddress: string;
  tags: { name: string; color: string }[]; // Add this line
}

const TaskSchema = new Schema<ITask>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    slug: { type: String, required: true },
    selectedWallet: { type: String, required: true },
    walletPrivateKey: { type: String, required: true },
    minFloorPricePercentage: { type: String, required: true },
    maxFloorPricePercentage: { type: String, required: true },
    selectedMarketplaces: { type: [String], required: true },
    running: { type: Boolean, default: false },
    contractAddress: { type: String, required: true },
    tags: { type: [{ name: String, color: String }], default: [] }, // Add this line
  },
  { timestamps: true }
);

const Task =
  (mongoose.models.Task as mongoose.Model<ITask>) ||
  mongoose.model<ITask>("Task", TaskSchema);
export default Task;
