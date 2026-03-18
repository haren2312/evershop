import { PageMetaInfo } from './pageMeta.js';

type GraphqlScalar = string | number | boolean | null;
type GraphqlResponseValue =
  | GraphqlScalar
  | GraphqlResponseValue[]
  | { [key: string]: GraphqlResponseValue };

interface Config {
  pageMeta: PageMetaInfo;
  tax: {
    priceIncludingTax: boolean;
  };
  catalog: {
    imageDimensions: { width: number; height: number };
  };
}

interface AppStateContextValue {
  graphqlResponse: Record<string, GraphqlResponseValue>;
  config: Config;
  propsMap: Record<string, any[]>;
  widgets?: {
    areaId: string[];
    id: string;
    type: string;
    sortOrder: number;
  }[];
  fetching: boolean;
}

interface AppContextDispatchValue {
  setData: React.Dispatch<React.SetStateAction<AppStateContextValue>>;
  fetchPageData: (url: string | URL) => Promise<void>;
}

export { AppStateContextValue, Config, AppContextDispatchValue };
