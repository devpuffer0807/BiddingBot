import mongoose, { Schema, Document } from "mongoose";

interface ITask extends Document {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  slug: string;
  selectedWallet: string;
  walletPrivateKey: string;
  selectedMarketplaces: string[];
  running: boolean;
  contractAddress: string;
  tags: { name: string; color: string }[];
  selectedTraits: Record<string, string[]>;
  traits: {
    categories: Record<string, string>;
    counts: Record<string, Record<string, number>>;
  };
  outbid: boolean;
  blurOutbidMargin: number | null;
  openseaOutbidMargin: number | null;
  magicedenOutbidMargin: number | null;
  counterbid: boolean;
  minFloorPrice: number;
  minTraitPrice: number;
  maxPurchase: number;
  pauseAllBids: boolean;
  stopAllBids: boolean;
  cancelAllBids: boolean;
  minPrice: number | null;
  maxPrice: number | null;
  minPriceType: "percentage" | "eth";
  maxPriceType: "percentage" | "eth";
}

const TaskSchema = new Schema<ITask>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    slug: { type: String, required: true },
    selectedWallet: { type: String, required: true },
    walletPrivateKey: { type: String, required: true },
    selectedMarketplaces: { type: [String], required: true },
    running: { type: Boolean, default: false },
    contractAddress: { type: String, required: true },
    tags: { type: [{ name: String, color: String }], default: [] },
    selectedTraits: { type: Schema.Types.Mixed, default: {} },
    traits: {
      categories: { type: Schema.Types.Mixed, default: {} },
      counts: { type: Schema.Types.Mixed, default: {} },
    },
    outbid: { type: Boolean, default: false },
    blurOutbidMargin: { type: Number, default: null },
    openseaOutbidMargin: { type: Number, default: null },
    magicedenOutbidMargin: { type: Number, default: null },
    counterbid: { type: Boolean, default: false },
    minFloorPrice: { type: Number, required: true },
    minTraitPrice: { type: Number, required: true },
    maxPurchase: { type: Number, required: true },
    pauseAllBids: { type: Boolean, default: false },
    stopAllBids: { type: Boolean, default: false },
    cancelAllBids: { type: Boolean, default: false },
    minPrice: { type: Number, required: true },
    maxPrice: { type: Number, required: true },
    minPriceType: { type: String, enum: ["percentage", "eth"], required: true },
    maxPriceType: { type: String, enum: ["percentage", "eth"], required: true },
  },
  { timestamps: true }
);

const Task = mongoose.models.Task || mongoose.model<ITask>("Task", TaskSchema);
export default Task;
