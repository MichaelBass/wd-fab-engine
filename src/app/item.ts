import { Map } from './map';

export class Item {
  ID: string;
  Name: string;
  Index: string;
  Prompt: string;
  Slope: string;
  Operator: string;
  Maps: Map[];
  Administered?: boolean;
  AnsweredItemResponseOID?: string;
}