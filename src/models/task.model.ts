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
  selectedTraits: Record<string, string[]>;
  traits: {
    categories: Record<string, string>;
    counts: Record<string, Record<string, number>>;
  };
  outbid: boolean;
  blurOutbidMargin: number | null; // Add this line
  openseaOutbidMargin: number | null; // Add this line
  magicedenOutbidMargin: number | null; // Add this line
  counterbid: boolean; // Add this line
  minFloorPrice: number; // Add this line
  minTraitPrice: number; // Add this line
  maxPurchase: number; // Add this line
  pauseAllBids: boolean; // Add this line
  stopAllBids: boolean; // Add this line
  cancelAllBids: boolean; // Add this line
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
    selectedTraits: { type: Schema.Types.Mixed, default: {} },
    traits: {
      categories: { type: Schema.Types.Mixed, default: {} },
      counts: { type: Schema.Types.Mixed, default: {} },
    },
    outbid: { type: Boolean, default: false }, // Add this line
    blurOutbidMargin: { type: Number, default: null }, // Add this line
    openseaOutbidMargin: { type: Number, default: null }, // Add this line
    magicedenOutbidMargin: { type: Number, default: null }, // Add this line
    counterbid: { type: Boolean, default: false }, // Add this line
    minFloorPrice: { type: Number, required: true }, // Add this line
    minTraitPrice: { type: Number, required: true }, // Add this line
    maxPurchase: { type: Number, required: true }, // Add this line
    pauseAllBids: { type: Boolean, default: false }, // Add this line
    stopAllBids: { type: Boolean, default: false }, // Add this line
    cancelAllBids: { type: Boolean, default: false }, // Add this line
  },
  { timestamps: true }
);

const Task =
  (mongoose.models.Task as mongoose.Model<ITask>) ||
  mongoose.model<ITask>("Task", TaskSchema);
export default Task;
