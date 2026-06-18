// Deep links de compra por companhia — espelha o buildDeepLink do flight.API
// (EmailService) para manter os mesmos destinos de checkout.

export type BookingFareType = 'cash' | 'pts' | 'hyb'

interface BookingParams {
  origin: string
  destination: string
  date: string // YYYY-MM-DD
  passengers: number
  fareType: BookingFareType
}

function azulLink({ origin, destination, date, passengers, fareType }: BookingParams): string {
  const cc = fareType === 'cash' ? 'BRL' : 'PTS'
  const [y, m, d] = date.split('-')
  const std = `${m}/${d}/${y}`
  return `https://www.voeazul.com.br/br/pt/home/selecao-voo?c[0].ds=${origin}&c[0].std=${std}&c[0].as=${destination}&p[0].t=ADT&p[0].c=${passengers}&p[0].cp=false&f.dl=3&f.dr=3&cc=${cc}`
}

function latamLink({ origin, destination, date, passengers, fareType }: BookingParams): string {
  const redemption = fareType === 'cash' ? 'false' : 'true'
  return `https://www.latamairlines.com/br/pt/oferta-voos?origin=${origin}&outbound=${date}&destination=${destination}&inbound=undefined&adt=${passengers}&chd=0&inf=0&trip=OW&cabin=Economy&redemption=${redemption}&sort=RECOMMENDED`
}

function britishAirwaysLink({ origin, destination, date, passengers }: BookingParams): string {
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

function ryanairLink({ origin, destination, date, passengers }: BookingParams): string {
  const p = new URLSearchParams({
    adults: String(passengers),
    teens: '0',
    children: '0',
    infants: '0',
    dateOut: date,
    dateIn: '',
    isConnectedFlight: 'false',
    isReturn: 'false',
    discount: '0',
    originIata: origin,
    destinationIata: destination,
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
