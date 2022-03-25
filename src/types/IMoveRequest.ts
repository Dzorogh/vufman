import { INodeModel } from "@/types/INodeModel";

export interface IMoveRequest {
  ids: INodeModel['id'][];
  destinationId: INodeModel['id'] | null;
}