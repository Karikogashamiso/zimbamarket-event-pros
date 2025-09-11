import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MapPin, Users, Eye, Accessibility } from 'lucide-react';

interface Seat {
  id: string;
  row: string;
  number: number;
  type: 'standard' | 'premium' | 'vip' | 'accessible';
  status: 'available' | 'selected' | 'occupied' | 'reserved';
  price_multiplier: number;
}

interface SeatSelectionProps {
  event: any;
  selectedSeats: Seat[];
  onSeatsChange: (seats: Seat[]) => void;
}

// Mock seat map data
const generateSeatMap = (): Seat[] => {
  const seats: Seat[] = [];
  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  
  rows.forEach((row, rowIndex) => {
    for (let number = 1; number <= 12; number++) {
      let type: Seat['type'] = 'standard';
      let status: Seat['status'] = 'available';
      let price_multiplier = 1.0;
      
      // Create different seat types
      if (rowIndex < 2) {
        type = 'vip';
        price_multiplier = 2.0;
      } else if (rowIndex < 4) {
        type = 'premium';
        price_multiplier = 1.5;
      }
      
      // Add some accessibility seats
      if (number <= 2 && ['A', 'B'].includes(row)) {
        type = 'accessible';
        price_multiplier = 1.0;
      }
      
      // Random occupied seats for demo
      if (Math.random() < 0.3) {
        status = 'occupied';
      }
      
      seats.push({
        id: `${row}${number}`,
        row,
        number,
        type,
        status,
        price_multiplier
      });
    }
  });
  
  return seats;
};

export const SeatSelection: React.FC<SeatSelectionProps> = ({
  event,
  selectedSeats,
  onSeatsChange
}) => {
  const [seatMap] = useState<Seat[]>(generateSeatMap());
  
  const handleSeatClick = (seat: Seat) => {
    if (seat.status === 'occupied' || seat.status === 'reserved') return;
    
    const isSelected = selectedSeats.some(s => s.id === seat.id);
    
    if (isSelected) {
      // Deselect seat
      onSeatsChange(selectedSeats.filter(s => s.id !== seat.id));
    } else {
      // Select seat (limit to 6 seats)
      if (selectedSeats.length < 6) {
        onSeatsChange([...selectedSeats, { ...seat, status: 'selected' }]);
      }
    }
  };

  const getSeatColor = (seat: Seat) => {
    const isSelected = selectedSeats.some(s => s.id === seat.id);
    
    if (isSelected) return 'bg-primary text-primary-foreground border-primary';
    if (seat.status === 'occupied') return 'bg-gray-400 text-gray-600 cursor-not-allowed';
    if (seat.status === 'reserved') return 'bg-yellow-400 text-yellow-800 cursor-not-allowed';
    
    switch (seat.type) {
      case 'vip': return 'bg-purple-100 text-purple-800 border-purple-300 hover:bg-purple-200';
      case 'premium': return 'bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-200';
      case 'accessible': return 'bg-green-100 text-green-800 border-green-300 hover:bg-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200';
    }
  };

  const getSeatIcon = (seat: Seat) => {
    if (seat.type === 'accessible') return <Accessibility className="h-3 w-3" />;
    return seat.number;
  };

  const totalPrice = selectedSeats.reduce((sum, seat) => {
    return sum + ((event?.price_from || 25) * seat.price_multiplier);
  }, 0);

  return (
    <div className="space-y-6">
      {/* Venue Info */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-2">
            <MapPin className="h-5 w-5 text-muted-foreground" />
            <div>
              <h3 className="font-semibold">{event?.venue || 'Rainbow Towers'}</h3>
              <p className="text-sm text-muted-foreground">{event?.location || 'Harare'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Seat Types</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-purple-100 border border-purple-300 rounded flex items-center justify-center text-xs">
                VIP
              </div>
              <span>VIP (2x price)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-blue-100 border border-blue-300 rounded flex items-center justify-center text-xs">
                P
              </div>
              <span>Premium (1.5x)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gray-100 border border-gray-300 rounded flex items-center justify-center text-xs">
                S
              </div>
              <span>Standard</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-green-100 border border-green-300 rounded flex items-center justify-center">
                <Accessibility className="h-3 w-3" />
              </div>
              <span>Accessible</span>
            </div>
          </div>
          
          <Separator className="my-3" />
          
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-primary rounded border"></div>
              <span>Selected</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-400 rounded border"></div>
              <span>Occupied</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-100 rounded border"></div>
              <span>Available</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stage/Screen */}
      <div className="text-center">
        <div className="bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20 rounded-lg p-3 mb-4">
          <div className="flex items-center justify-center gap-2">
            <Eye className="h-4 w-4" />
            <span className="font-semibold text-sm">STAGE</span>
          </div>
        </div>
      </div>

      {/* Seat Map */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-2">
            {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map((row) => (
              <div key={row} className="flex items-center gap-2">
                <div className="w-6 text-center text-sm font-semibold text-muted-foreground">
                  {row}
                </div>
                <div className="flex gap-1">
                  {seatMap
                    .filter(seat => seat.row === row)
                    .map((seat) => (
                      <button
                        key={seat.id}
                        onClick={() => handleSeatClick(seat)}
                        disabled={seat.status === 'occupied' || seat.status === 'reserved'}
                        className={`
                          w-8 h-8 text-xs rounded border-2 transition-all duration-200 
                          flex items-center justify-center font-medium
                          ${getSeatColor(seat)}
                          ${seat.status === 'occupied' || seat.status === 'reserved' 
                            ? 'cursor-not-allowed opacity-60' 
                            : 'cursor-pointer active:scale-95'
                          }
                        `}
                      >
                        {getSeatIcon(seat)}
                      </button>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Selected Seats Summary */}
      {selectedSeats.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4" />
              Selected Seats ({selectedSeats.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {selectedSeats.map((seat) => (
                <div key={seat.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">{seat.id}</Badge>
                    <span className="text-sm capitalize">{seat.type}</span>
                  </div>
                  <span className="font-semibold">
                    ${((event?.price_from || 25) * seat.price_multiplier).toFixed(2)}
                  </span>
                </div>
              ))}
              
              <Separator />
              
              <div className="flex items-center justify-between font-semibold">
                <span>Total</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};