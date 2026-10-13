/**
 * Plain-language company profiles for BRVM listed shares.
 * Short descriptions written by TekkiTrade for beginners, not official data.
 * Prices always come from the BRVM; this file only adds context.
 */

export type Sector =
  | 'Télécoms'
  | 'Finance'
  | 'Énergie'
  | 'Consommation'
  | 'Industrie'
  | 'Services publics'
  | 'Autres'

export type CompanyProfile = {
  name: string
  sector: Sector
  country: string
  activity: string
}

const bank = (name: string, country: string, group: string) => ({
  name,
  sector: 'Finance' as const,
  country,
  activity: `Banque commerciale${
    group ? ` du groupe ${group}` : ''
  } : comptes, crédits et services aux particuliers et entreprises.`,
})

export const COMPANIES: Record<string, CompanyProfile> = {
  ABJC: {
    name: 'Servair Abidjan',
    sector: 'Consommation',
    country: 'Côte d’Ivoire',
    activity:
      'Restauration et services aux compagnies aériennes à l’aéroport d’Abidjan.',
  },
  BBGC: bank('Bridge Bank Group Côte d’Ivoire', 'Côte d’Ivoire', 'Bridge Bank'),
  BICB: bank('BIIC Bénin', 'Bénin', ''),
  BICC: bank('BICI Côte d’Ivoire', 'Côte d’Ivoire', ''),
  BNBC: {
    name: 'Bernabé Côte d’Ivoire',
    sector: 'Industrie',
    country: 'Côte d’Ivoire',
    activity: 'Distribution de quincaillerie, d’outillage et de matériaux.',
  },
  BOAB: bank('Bank of Africa Bénin', 'Bénin', 'Bank of Africa'),
  BOABF: bank('Bank of Africa Burkina Faso', 'Burkina Faso', 'Bank of Africa'),
  BOAC: bank('Bank of Africa Côte d’Ivoire', 'Côte d’Ivoire', 'Bank of Africa'),
  BOAM: bank('Bank of Africa Mali', 'Mali', 'Bank of Africa'),
  BOAN: bank('Bank of Africa Niger', 'Niger', 'Bank of Africa'),
  BOAS: bank('Bank of Africa Sénégal', 'Sénégal', 'Bank of Africa'),
  CABC: {
    name: 'Sicable Côte d’Ivoire',
    sector: 'Industrie',
    country: 'Côte d’Ivoire',
    activity: 'Fabrication de câbles électriques et téléphoniques.',
  },
  CBIBF: bank('Coris Bank International', 'Burkina Faso', 'Coris'),
  CFAC: {
    name: 'CFAO Mobility Côte d’Ivoire',
    sector: 'Consommation',
    country: 'Côte d’Ivoire',
    activity: 'Distribution et entretien de véhicules.',
  },
  CIEC: {
    name: 'CIE Côte d’Ivoire',
    sector: 'Services publics',
    country: 'Côte d’Ivoire',
    activity:
      'Distribution et commercialisation de l’électricité en Côte d’Ivoire.',
  },
  ECOC: bank('Ecobank Côte d’Ivoire', 'Côte d’Ivoire', 'Ecobank'),
  ETIT: {
    name: 'Ecobank Transnational Inc.',
    sector: 'Finance',
    country: 'Togo',
    activity:
      'Société mère du groupe bancaire panafricain Ecobank, présent dans plus de 30 pays.',
  },
  FTSC: {
    name: 'Filtisac',
    sector: 'Industrie',
    country: 'Côte d’Ivoire',
    activity: 'Emballages (sacs tissés) pour l’agriculture et l’industrie.',
  },
  LNBB: {
    name: 'Loterie Nationale du Bénin',
    sector: 'Consommation',
    country: 'Bénin',
    activity: 'Jeux de loterie et paris au Bénin.',
  },
  NEIC: {
    name: 'NEI-CEDA Côte d’Ivoire',
    sector: 'Consommation',
    country: 'Côte d’Ivoire',
    activity: 'Édition et distribution de livres, notamment scolaires.',
  },
  NSBC: bank('NSIA Banque Côte d’Ivoire', 'Côte d’Ivoire', 'NSIA'),
  NTLC: {
    name: 'Nestlé Côte d’Ivoire',
    sector: 'Consommation',
    country: 'Côte d’Ivoire',
    activity: 'Produits alimentaires et boissons de grande consommation.',
  },
  ONTBF: {
    name: 'Onatel Burkina Faso',
    sector: 'Télécoms',
    country: 'Burkina Faso',
    activity: 'Opérateur télécom au Burkina Faso (mobile, fixe, internet).',
  },
  ORAC: {
    name: 'Orange Côte d’Ivoire',
    sector: 'Télécoms',
    country: 'Côte d’Ivoire',
    activity: 'Opérateur mobile, internet et Mobile Money en Côte d’Ivoire.',
  },
  ORGT: {
    name: 'Oragroup',
    sector: 'Finance',
    country: 'Togo',
    activity:
      'Groupe bancaire Orabank, présent dans plusieurs pays d’Afrique de l’Ouest et centrale.',
  },
  PALC: {
    name: 'Palm Côte d’Ivoire',
    sector: 'Consommation',
    country: 'Côte d’Ivoire',
    activity: 'Plantations de palmiers et production d’huile de palme.',
  },
  PRSC: {
    name: 'Tractafric Motors Côte d’Ivoire',
    sector: 'Consommation',
    country: 'Côte d’Ivoire',
    activity: 'Distribution de véhicules et d’engins.',
  },
  SAFC: {
    name: 'SAFCA Côte d’Ivoire',
    sector: 'Finance',
    country: 'Côte d’Ivoire',
    activity: 'Crédit-bail et financement d’équipements.',
  },
  SCRC: {
    name: 'Sucrivoire',
    sector: 'Consommation',
    country: 'Côte d’Ivoire',
    activity: 'Culture de la canne et production de sucre.',
  },
  SDCC: {
    name: 'SODECI',
    sector: 'Services publics',
    country: 'Côte d’Ivoire',
    activity: 'Production et distribution d’eau potable en Côte d’Ivoire.',
  },
  SDSC: {
    name: 'Africa Global Logistics Côte d’Ivoire',
    sector: 'Industrie',
    country: 'Côte d’Ivoire',
    activity: 'Logistique, transit et transport de marchandises.',
  },
  SEMC: {
    name: 'Eviosys Packaging Siem Côte d’Ivoire',
    sector: 'Industrie',
    country: 'Côte d’Ivoire',
    activity: 'Fabrication d’emballages métalliques.',
  },
  SGBC: bank(
    'Société Générale Côte d’Ivoire',
    'Côte d’Ivoire',
    'Société Générale',
  ),
  SHEC: {
    name: 'Vivo Energy Côte d’Ivoire',
    sector: 'Énergie',
    country: 'Côte d’Ivoire',
    activity: 'Distribution de carburants et lubrifiants (stations Shell).',
  },
  SIBC: bank('Société Ivoirienne de Banque', 'Côte d’Ivoire', ''),
  SICC: {
    name: 'SICOR Côte d’Ivoire',
    sector: 'Consommation',
    country: 'Côte d’Ivoire',
    activity: 'Agro-industrie.',
  },
  SIVC: {
    name: 'Erium Côte d’Ivoire',
    sector: 'Industrie',
    country: 'Côte d’Ivoire',
    activity: 'Production et distribution de gaz industriels et médicaux.',
  },
  SLBC: {
    name: 'Solibra',
    sector: 'Consommation',
    country: 'Côte d’Ivoire',
    activity: 'Brasserie : bières et boissons gazeuses.',
  },
  SMBC: {
    name: 'SMB Côte d’Ivoire',
    sector: 'Énergie',
    country: 'Côte d’Ivoire',
    activity: 'Production de bitume pour les routes.',
  },
  SNTS: {
    name: 'Sonatel',
    sector: 'Télécoms',
    country: 'Sénégal',
    activity:
      'Opérateur télécom du groupe Orange au Sénégal, aussi présent au Mali, en Guinée, en Guinée-Bissau et en Sierra Leone.',
  },
  SOGC: {
    name: 'SOGB Côte d’Ivoire',
    sector: 'Consommation',
    country: 'Côte d’Ivoire',
    activity: 'Plantations d’hévéa (caoutchouc) et de palmier à huile.',
  },
  SPHC: {
    name: 'SAPH Côte d’Ivoire',
    sector: 'Consommation',
    country: 'Côte d’Ivoire',
    activity: 'Production de caoutchouc naturel.',
  },
  STAC: {
    name: 'SETAO Côte d’Ivoire',
    sector: 'Industrie',
    country: 'Côte d’Ivoire',
    activity: 'Bâtiment et travaux publics.',
  },
  STBC: {
    name: 'SITAB',
    sector: 'Consommation',
    country: 'Côte d’Ivoire',
    activity: 'Fabrication de cigarettes.',
  },
  SVOC: {
    name: 'Movis Côte d’Ivoire',
    sector: 'Industrie',
    country: 'Côte d’Ivoire',
    activity: 'Transport et logistique.',
  },
  TTLC: {
    name: 'TotalEnergies Marketing Côte d’Ivoire',
    sector: 'Énergie',
    country: 'Côte d’Ivoire',
    activity: 'Distribution de carburants, gaz et lubrifiants.',
  },
  TTLS: {
    name: 'TotalEnergies Marketing Sénégal',
    sector: 'Énergie',
    country: 'Sénégal',
    activity: 'Distribution de carburants, gaz et lubrifiants.',
  },
  UNLC: {
    name: 'Unilever Côte d’Ivoire',
    sector: 'Consommation',
    country: 'Côte d’Ivoire',
    activity: 'Produits d’hygiène et d’entretien de grande consommation.',
  },
  UNXC: {
    name: 'Uniwax',
    sector: 'Consommation',
    country: 'Côte d’Ivoire',
    activity: 'Fabrication de tissus wax.',
  },
}

export const companyFor = (symbol: string, fallbackName?: string) =>
  COMPANIES[symbol] ?? {
    name: fallbackName ?? symbol,
    sector: 'Autres' as const,
    country: '',
    activity: '',
  }
