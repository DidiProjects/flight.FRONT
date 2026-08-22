// Per-airline booking deep links — mirrors buildDeepLink in flight.API
// (EmailService) so both land on the same checkout.

export type BookingFareType = 'cash' | 'pts' | 'hyb'

interface BookingParams {
  origin: string
  destination: string
  date: string // YYYY-MM-DD
  passengers: number
  fareType: BookingFareType
  /** Round-trip routine: the link goes to the SAME search that produced the price. */
  returnDate?: string
}

const azulDate = (iso: string) => {
  const [y, m, d] = iso.split('-')
  return `${m}/${d}/${y}`
}

function azulLink({ origin, destination, date, passengers, fareType, returnDate }: BookingParams): string {
  const cc = fareType === 'cash' ? 'BRL' : 'PTS'
  const leg0 = `c[0].ds=${origin}&c[0].std=${azulDate(date)}&c[0].as=${destination}`
  const leg1 = returnDate
    ? `&c[1].ds=${destination}&c[1].std=${azulDate(returnDate)}&c[1].as=${origin}`
    : ''
  return `https://www.voeazul.com.br/br/pt/home/selecao-voo?${leg0}${leg1}&p[0].t=ADT&p[0].c=${passengers}&p[0].cp=false&f.dl=3&f.dr=3&cc=${cc}`
}

function latamLink({ origin, destination, date, passengers, fareType, returnDate }: BookingParams): string {
  const redemption = fareType === 'cash' ? 'false' : 'true'
  // `trip=RT&inbound=<date>` checked against the site on 2026-08-05.
  const inbound = returnDate ?? 'undefined'
  const trip = returnDate ? 'RT' : 'OW'
  return `https://www.latamairlines.com/br/pt/oferta-voos?origin=${origin}&outbound=${date}&destination=${destination}&inbound=${inbound}&adt=${passengers}&chd=0&inf=0&trip=${trip}&cabin=Economy&redemption=${redemption}&sort=RECOMMENDED`
}

/**
 * One-way on the new UI; round-trip on the old one (`flightList`, two-leg `onds`
 * + `ond=2`) — the only BA round-trip flow measured against the site.
 */
function britishAirwaysLink({ origin, destination, date, passengers, returnDate }: BookingParams): string {
  if (returnDate) {
    const p = new URLSearchParams({
      onds: `${origin}-${destination}_${date},${destination}-${origin}_${returnDate}`,
      ad: String(passengers),
      yad: '0',
      ch: '0',
      inf: '0',
      cabin: 'M',
      flex: 'LOWEST',
      ond: '2',
    })
    return `https://www.britishairways.com/travel/book/public/en_gb/flightList?${p.toString()}`
  }

  const p = new URLSearchParams({
    trip: 'oneWay',
    departureDate: date,
    from: origin,
    to: destination,
    travelClass: 'economy',
    adults: String(passengers),
    youngAdults: '0',
    children: '0',
    infants: '0',
    bound: 'outbound',
  })
  return `https://www.britishairways.com/nx/b/airselect/en/gbr/book/search/?${p.toString()}`
}

/** Mirrors the scraper `buildSearchUrl`: the `tp*` params follow the search. */
function ryanairLink({ origin, destination, date, passengers, returnDate }: BookingParams): string {
  const p = new URLSearchParams({
    adults: String(passengers),
    teens: '0',
    children: '0',
    infants: '0',
    dateOut: date,
    dateIn: returnDate ?? '',
    isConnectedFlight: 'false',
    discount: '0',
    promoCode: '',
    isReturn: returnDate ? 'true' : 'false',
    originIata: origin,
    destinationIata: destination,
    tpAdults: String(passengers),
    tpTeens: '0',
    tpChildren: '0',
    tpInfants: '0',
    tpStartDate: date,
    tpEndDate: returnDate ?? '',
    tpDiscount: '0',
    tpPromoCode: '',
    tpOriginIata: origin,
    tpDestinationIata: destination,
  })
  return `https://www.ryanair.com/gb/en/trip/flights/select?${p.toString()}`
}

export function buildBookingLink(airline: string, params: BookingParams): string | null {
  switch (airline.toLowerCase()) {
    case 'azul':           return azulLink(params)
    case 'latam':          return latamLink(params)
    case 'britishairways': return britishAirwaysLink(params)
    case 'ryanair':        return ryanairLink(params)
    default:               return null
  }
}
