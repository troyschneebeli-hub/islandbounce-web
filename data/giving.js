// Our giving pledge, shown on /giving, in the footer and on /about. Change the numbers here only.
// `ledger`: one entry per quarter once commission comes in, newest first, with proof of the donation:
//   { period: "Jan to Mar 2027", earnedAUD: 0, donatedAUD: 0, donatedOn: "2027-04-10", proof: "https://..." }
// Never claim a donation that isn't in the ledger.
export const GIVING = {
  percent: 10,
  org: "Gili Eco Trust",
  orgUrl: "https://www.gilieco.com",
  orgHelpUrl: "https://www.gilieco.com/how-to-help",
  ledger: [],
};

export const GIVING_LINE = `${GIVING.percent}% of every commission we earn goes to ${GIVING.org}`;
