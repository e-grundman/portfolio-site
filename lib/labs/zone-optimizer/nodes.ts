/**
 * Candidate fulfillment nodes.
 *
 * Twelve locations chosen because they are the places third party logistics
 * networks actually put buildings: port proximity, population reach, labor
 * availability, and in two cases state tax treatment. The ZIP3 is the modeling
 * unit. Nothing here describes any real network.
 */
export type FulfillmentNode = {
  id: string;
  zip3: string;
  city: string;
  state: string;
  /** Why a network would put a building here. Shown in the lab UI. */
  rationale: string;
};

export const candidateNodes: FulfillmentNode[] = [
  {
    id: "edison-nj",
    zip3: "088",
    city: "Edison",
    state: "NJ",
    rationale: "Reaches the Northeast corridor overnight by ground.",
  },
  {
    id: "allentown-pa",
    zip3: "180",
    city: "Allentown",
    state: "PA",
    rationale: "Northeast reach at lower cost than the New Jersey ports.",
  },
  {
    id: "atlanta-ga",
    zip3: "303",
    city: "Atlanta",
    state: "GA",
    rationale: "Southeast hub with strong carrier density.",
  },
  {
    id: "miami-fl",
    zip3: "331",
    city: "Miami",
    state: "FL",
    rationale: "Florida peninsula and Latin America gateway.",
  },
  {
    id: "indianapolis-in",
    zip3: "462",
    city: "Indianapolis",
    state: "IN",
    rationale: "Midwest crossroads with unusually broad two day ground reach.",
  },
  {
    id: "chicago-il",
    zip3: "606",
    city: "Chicago",
    state: "IL",
    rationale: "Rail and parcel hub for the upper Midwest.",
  },
  {
    id: "kansas-city-ks",
    zip3: "660",
    city: "Kansas City",
    state: "KS",
    rationale: "Geographic center of the contiguous population.",
  },
  {
    id: "dallas-tx",
    zip3: "750",
    city: "Dallas",
    state: "TX",
    rationale: "South Central reach and inbound from Gulf ports.",
  },
  {
    id: "denver-co",
    zip3: "800",
    city: "Denver",
    state: "CO",
    rationale: "Mountain West coverage where zones otherwise stretch.",
  },
  {
    id: "salt-lake-city-ut",
    zip3: "840",
    city: "Salt Lake City",
    state: "UT",
    rationale: "West without California operating cost.",
  },
  {
    id: "las-vegas-nv",
    zip3: "890",
    city: "Las Vegas",
    state: "NV",
    rationale: "Serves Southern California by ground without a California node.",
  },
  {
    id: "city-of-industry-ca",
    zip3: "917",
    city: "City of Industry",
    state: "CA",
    rationale: "Los Angeles import gateway and the largest single metro reach.",
  },
  {
    id: "kent-wa",
    zip3: "981",
    city: "Kent",
    state: "WA",
    rationale: "Pacific Northwest coverage from Seattle.",
  },
];

export const nodesById = new Map(candidateNodes.map((node) => [node.id, node]));

export function nodeByZip3(zip3: string): FulfillmentNode | undefined {
  return candidateNodes.find((node) => node.zip3 === zip3);
}
