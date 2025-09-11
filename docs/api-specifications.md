# ZimEventPro Ticketing API Specifications

## Base URL
```
https://pxpdjfkppgoaygdfmaqr.supabase.co/functions/v1
```

## Authentication
All authenticated endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <supabase_jwt_token>
```

## 1. Orders Management

### 1.1 Create Order
**Endpoint:** `POST /create-order`

**Request:**
```json
{
  "event_id": "123e4567-e89b-12d3-a456-426614174000",
  "trip_id": null,
  "customer": {
    "first_name": "John",
    "last_name": "Doe", 
    "email": "john.doe@email.com",
    "phone": "+263771234567"
  },
  "tickets": [
    {
      "ticket_type_id": "456e7890-e89b-12d3-a456-426614174001",
      "quantity": 2,
      "seat_preferences": ["A1", "A2"]
    }
  ],
  "special_requests": "Wheelchair accessible seats",
  "referral_code": "FRIEND20"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "order_id": "789e0123-e89b-12d3-a456-426614174002",
    "order_number": "ZEP-2024-001234",
    "total_amount": 150.00,
    "currency": "USD",
    "expires_at": "2024-01-15T10:30:00Z",
    "payment_methods": ["card", "ecocash", "onemoney"],
    "tickets": [
      {
        "ticket_id": "abc12345-e89b-12d3-a456-426614174003",
        "ticket_number": "T-2024-001234-001",
        "seat_id": "def67890-e89b-12d3-a456-426614174004",
        "price": 75.00
      }
    ]
  }
}
```

### 1.2 Get Order Details
**Endpoint:** `GET /orders/{order_id}`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "789e0123-e89b-12d3-a456-426614174002",
    "order_number": "ZEP-2024-001234",
    "status": "confirmed",
    "payment_status": "paid",
    "total_amount": 150.00,
    "currency": "USD",
    "customer": {
      "first_name": "John",
      "last_name": "Doe",
      "email": "john.doe@email.com",
      "phone": "+263771234567"
    },
    "event": {
      "title": "Harare Music Festival 2024",
      "start_datetime": "2024-02-20T18:00:00Z",
      "venue_name": "National Sports Stadium"
    },
    "tickets": [
      {
        "ticket_number": "T-2024-001234-001",
        "holder_name": "John Doe",
        "seat": "A1",
        "status": "valid",
        "qr_code": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
      }
    ],
    "created_at": "2024-01-15T09:30:00Z"
  }
}
```

### 1.3 List User Orders
**Endpoint:** `GET /orders?page=1&limit=20&status=confirmed`

**Response:**
```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "id": "789e0123-e89b-12d3-a456-426614174002",
        "order_number": "ZEP-2024-001234",
        "event_title": "Harare Music Festival 2024",
        "total_amount": 150.00,
        "status": "confirmed",
        "created_at": "2024-01-15T09:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "pages": 3
    }
  }
}
```

## 2. Payment Processing

### 2.1 Initialize Payment
**Endpoint:** `POST /payments/initialize`

**Request:**
```json
{
  "order_id": "789e0123-e89b-12d3-a456-426614174002",
  "payment_method": "ecocash",
  "provider_data": {
    "phone_number": "+263771234567"
  },
  "return_url": "https://zimeventpro.com/payment/success",
  "cancel_url": "https://zimeventpro.com/payment/cancel"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "payment_id": "pay_abc123def456",
    "status": "pending",
    "payment_url": "https://ecocash.co.zw/payment/abc123",
    "qr_code": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
    "instructions": "Dial *151# and follow the prompts to complete payment",
    "expires_at": "2024-01-15T10:45:00Z"
  }
}
```

### 2.2 Card Payment (Stripe)
**Endpoint:** `POST /payments/card`

**Request:**
```json
{
  "order_id": "789e0123-e89b-12d3-a456-426614174002",
  "payment_method": "card",
  "return_url": "https://zimeventpro.com/payment/success",
  "cancel_url": "https://zimeventpro.com/payment/cancel"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "checkout_url": "https://checkout.stripe.com/c/pay/cs_test_123...",
    "session_id": "cs_test_123456789"
  }
}
```

### 2.3 Check Payment Status
**Endpoint:** `GET /payments/{payment_id}/status`

**Response:**
```json
{
  "success": true,
  "data": {
    "payment_id": "pay_abc123def456",
    "order_id": "789e0123-e89b-12d3-a456-426614174002", 
    "status": "completed",
    "amount": 150.00,
    "currency": "USD",
    "method": "ecocash",
    "transaction_reference": "ECO-2024-001234567",
    "processed_at": "2024-01-15T10:35:00Z"
  }
}
```

### 2.4 Payment Webhook (EcoCash)
**Endpoint:** `POST /webhooks/ecocash`

**Request Payload:**
```json
{
  "transaction_id": "ECO-2024-001234567",
  "order_reference": "ZEP-2024-001234",
  "amount": 150.00,
  "currency": "USD",
  "status": "successful",
  "phone_number": "+263771234567",
  "timestamp": "2024-01-15T10:35:00Z",
  "signature": "abc123def456..."
}
```

## 3. Ticket Management

### 3.1 Issue Tickets
**Endpoint:** `POST /tickets/issue`

**Request:**
```json
{
  "order_id": "789e0123-e89b-12d3-a456-426614174002",
  "delivery_method": "email", // email, sms, digital_wallet
  "personalization": [
    {
      "ticket_id": "abc12345-e89b-12d3-a456-426614174003",
      "holder_name": "John Doe",
      "holder_email": "john.doe@email.com"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "tickets_issued": 2,
    "delivery_status": "sent",
    "tickets": [
      {
        "ticket_id": "abc12345-e89b-12d3-a456-426614174003",
        "ticket_number": "T-2024-001234-001",
        "qr_code": "ZEP-T-2024-001234-001-HASH",
        "download_url": "https://zimeventpro.com/tickets/download/abc12345",
        "status": "issued"
      }
    ]
  }
}
```

### 3.2 Transfer Ticket
**Endpoint:** `POST /tickets/{ticket_id}/transfer`

**Request:**
```json
{
  "new_holder": {
    "first_name": "Jane",
    "last_name": "Smith", 
    "email": "jane.smith@email.com",
    "phone": "+263771234568"
  },
  "transfer_reason": "Gift to friend",
  "notify_recipient": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "transfer_id": "transfer_123456",
    "status": "completed",
    "transferred_at": "2024-01-15T11:00:00Z",
    "new_ticket_number": "T-2024-001234-001-TR"
  }
}
```

### 3.3 Validate Ticket
**Endpoint:** `GET /tickets/{ticket_id}/validate`

**Response:**
```json
{
  "success": true,
  "data": {
    "valid": true,
    "ticket": {
      "ticket_number": "T-2024-001234-001",
      "holder_name": "John Doe",
      "event": "Harare Music Festival 2024",
      "seat": "A1",
      "status": "valid",
      "entry_count": 0,
      "max_entries": 1
    },
    "event": {
      "title": "Harare Music Festival 2024",
      "start_datetime": "2024-02-20T18:00:00Z",
      "venue": "National Sports Stadium",
      "gates_open": "2024-02-20T16:00:00Z"
    }
  }
}
```

## 4. Ticket Scanning

### 4.1 Scan Ticket (Entry)
**Endpoint:** `POST /scan/entry`

**Request:**
```json
{
  "qr_code": "ZEP-T-2024-001234-001-HASH",
  "scan_location": "Main Entrance - Gate 1",
  "scanner_device": {
    "device_id": "SCANNER-001",
    "staff_member": "John Staff",
    "location": {
      "latitude": -17.8216,
      "longitude": 31.0492
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "scan_result": "valid",
    "action": "allow_entry",
    "ticket": {
      "ticket_number": "T-2024-001234-001",
      "holder_name": "John Doe",
      "seat": "A1",
      "event": "Harare Music Festival 2024"
    },
    "scan_record": {
      "scan_id": "scan_123456",
      "timestamp": "2024-02-20T17:30:00Z",
      "entry_count": 1
    },
    "warnings": []
  }
}
```

### 4.2 Scan Result - Invalid Ticket
**Response:**
```json
{
  "success": false,
  "data": {
    "scan_result": "invalid",
    "action": "deny_entry",
    "reason": "ticket_already_used",
    "details": {
      "last_scan": "2024-02-20T17:15:00Z",
      "scan_location": "VIP Entrance"
    },
    "scan_record": {
      "scan_id": "scan_123457",
      "timestamp": "2024-02-20T17:30:00Z"
    }
  }
}
```

### 4.3 Bulk Scan Report
**Endpoint:** `GET /scan/report?event_id={event_id}&date=2024-02-20`

**Response:**
```json
{
  "success": true,
  "data": {
    "event": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "title": "Harare Music Festival 2024"
    },
    "summary": {
      "total_tickets": 5000,
      "scanned_tickets": 4850,
      "attendance_rate": 97.0,
      "peak_entry_time": "2024-02-20T17:45:00Z"
    },
    "scan_locations": [
      {
        "location": "Main Entrance - Gate 1",
        "scanned_count": 2500,
        "scan_rate": "120/hour"
      }
    ],
    "issues": [
      {
        "type": "duplicate_scan",
        "count": 15,
        "tickets": ["T-2024-001234-001"]
      }
    ]
  }
}
```

## 5. Refunds Management

### 5.1 Request Refund
**Endpoint:** `POST /refunds/request`

**Request:**
```json
{
  "order_id": "789e0123-e89b-12d3-a456-426614174002",
  "refund_type": "partial", // full, partial, cancellation
  "ticket_ids": ["abc12345-e89b-12d3-a456-426614174003"],
  "reason": "event_cancelled",
  "refund_reason": "Unable to attend due to illness",
  "supporting_documents": [
    "https://storage.supabase.co/docs/medical_certificate.pdf"
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "refund_request_id": "refund_123456",
    "status": "pending_review",
    "eligible_amount": 120.00,
    "service_fee_refundable": 15.00,
    "processing_fee": 5.00,
    "net_refund": 130.00,
    "estimated_processing_days": 7,
    "submitted_at": "2024-01-16T09:00:00Z"
  }
}
```

### 5.2 Process Refund (Admin)
**Endpoint:** `POST /refunds/{refund_id}/process`

**Request:**
```json
{
  "action": "approve", // approve, reject, request_info
  "refund_amount": 130.00,
  "processing_notes": "Refund approved - event was cancelled",
  "refund_method": "original_payment" // original_payment, bank_transfer, ecocash
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "refund_id": "refund_123456",
    "status": "approved",
    "refund_amount": 130.00,
    "processing_method": "ecocash",
    "estimated_completion": "2024-01-18T17:00:00Z",
    "reference_number": "REF-2024-001234"
  }
}
```

### 5.3 Refund Status Check
**Endpoint:** `GET /refunds/{refund_id}/status`

**Response:**
```json
{
  "success": true,
  "data": {
    "refund_id": "refund_123456",
    "order_id": "789e0123-e89b-12d3-a456-426614174002",
    "status": "completed",
    "refund_amount": 130.00,
    "processed_at": "2024-01-17T14:30:00Z",
    "refund_reference": "REF-2024-001234",
    "payment_details": {
      "method": "ecocash",
      "account": "+263771234567",
      "transaction_id": "ECO-REF-2024-001234"
    }
  }
}
```

## 6. Reporting & Analytics

### 6.1 Sales Report
**Endpoint:** `GET /reports/sales?event_id={event_id}&period=daily&start_date=2024-01-01&end_date=2024-01-31`

**Response:**
```json
{
  "success": true,
  "data": {
    "period": "2024-01-01 to 2024-01-31",
    "summary": {
      "total_revenue": 125000.00,
      "total_tickets_sold": 2500,
      "total_orders": 1200,
      "average_order_value": 104.17,
      "refund_rate": 2.5
    },
    "daily_breakdown": [
      {
        "date": "2024-01-15",
        "revenue": 15000.00,
        "tickets_sold": 300,
        "orders": 145
      }
    ],
    "payment_methods": [
      {
        "method": "ecocash",
        "revenue": 75000.00,
        "percentage": 60.0
      },
      {
        "method": "card",
        "revenue": 50000.00,
        "percentage": 40.0
      }
    ],
    "ticket_types": [
      {
        "name": "VIP",
        "sold": 500,
        "revenue": 50000.00
      },
      {
        "name": "General",
        "sold": 2000,
        "revenue": 75000.00
      }
    ]
  }
}
```

### 6.2 Attendance Analytics
**Endpoint:** `GET /reports/attendance?event_id={event_id}`

**Response:**
```json
{
  "success": true,
  "data": {
    "event": {
      "title": "Harare Music Festival 2024",
      "date": "2024-02-20"
    },
    "attendance": {
      "total_capacity": 5000,
      "tickets_sold": 4850,
      "tickets_scanned": 4500,
      "attendance_rate": 92.8,
      "no_shows": 350
    },
    "demographics": {
      "age_groups": [
        {"range": "18-25", "count": 1800, "percentage": 40.0},
        {"range": "26-35", "count": 1350, "percentage": 30.0}
      ],
      "location": [
        {"city": "Harare", "count": 3600, "percentage": 80.0},
        {"city": "Bulawayo", "count": 450, "percentage": 10.0}
      ]
    },
    "entry_patterns": {
      "peak_entry_time": "17:45",
      "average_queue_time": "12 minutes",
      "busiest_gate": "Main Entrance - Gate 1"
    }
  }
}
```

### 6.3 Financial Report
**Endpoint:** `GET /reports/financial?organizer_id={organizer_id}&period=monthly&year=2024&month=1`

**Response:**
```json
{
  "success": true,
  "data": {
    "period": "January 2024",
    "gross_revenue": 125000.00,
    "platform_fees": 6250.00,
    "payment_processing_fees": 2500.00,
    "refunds": 3000.00,
    "net_revenue": 113250.00,
    "events_count": 5,
    "breakdown": [
      {
        "event_title": "Harare Music Festival 2024",
        "gross_revenue": 85000.00,
        "net_revenue": 78250.00,
        "tickets_sold": 1700
      }
    ],
    "payment_processing": [
      {
        "method": "ecocash",
        "volume": 75000.00,
        "fees": 1500.00,
        "net": 73500.00
      },
      {
        "method": "stripe",
        "volume": 50000.00,
        "fees": 1000.00,
        "net": 49000.00
      }
    ],
    "payout_schedule": {
      "next_payout_date": "2024-02-05",
      "payout_amount": 113250.00,
      "payout_method": "bank_transfer"
    }
  }
}
```

## Error Responses

### Standard Error Format
```json
{
  "success": false,
  "error": {
    "code": "INVALID_TICKET_TYPE",
    "message": "The specified ticket type is not available for this event",
    "details": {
      "ticket_type_id": "invalid_id",
      "available_types": ["general", "vip"]
    }
  }
}
```

### Common Error Codes
- `ORDER_EXPIRED` - Order has exceeded its expiration time
- `INSUFFICIENT_INVENTORY` - Not enough tickets available
- `PAYMENT_FAILED` - Payment processing failed
- `INVALID_QR_CODE` - QR code format is invalid
- `TICKET_ALREADY_SCANNED` - Ticket has been used for entry
- `REFUND_NOT_ELIGIBLE` - Ticket is not eligible for refund
- `EVENT_CANCELLED` - Event has been cancelled
- `UNAUTHORIZED` - Authentication required or insufficient permissions

## Rate Limiting
- **General endpoints:** 1000 requests per hour per user
- **Scan endpoints:** 10000 requests per hour per scanner device
- **Payment endpoints:** 100 requests per hour per user
- **Reporting endpoints:** 500 requests per hour per user

## Webhook Security
All webhooks include signature verification using HMAC-SHA256. Verify signatures using the webhook secret provided during integration setup.

## API Versioning
API version is specified in the URL path: `/v1/endpoint`
Current version: `v1`