const API = "https://api.gatcg.com";
const IMG = (path) => (path ? API + path : "");
const CARD_BACK = API + "/cards/images/card-back.jpg";

const RARITY = {
  1: { text: "Comum", display: "C" },
  2: { text: "Incomum", display: "U" },
  3: { text: "Rara", display: "R" },
  4: { text: "Super Rara", display: "SR" },
  5: { text: "Ultra Rara", display: "UR" },
  6: { text: "Promo Rara", display: "PR" },
  7: { text: "Collector Super Rara", display: "CSR" },
  8: { text: "Collector Ultra Rara", display: "CUR" },
  9: { text: "Collector Promo Rara", display: "CPR" },
};

const TYPE_PT = {
  CHAMPION: "Campeao",
  ALLY: "Aliado",
  ACTION: "Acao",
  ATTACK: "Ataque",
  ITEM: "Item",
  WEAPON: "Arma",
  REGALIA: "Regalia",
  DOMAIN: "Dominio",
  PHANTASIA: "Fantasia",
};

const COST_PT = {
  memory: "Memoria",
  reserve: "Reserva",
  none: "Nenhum",
};

const SPEED_PT = {
  true: "Rapida",
  false: "Lenta",
};
