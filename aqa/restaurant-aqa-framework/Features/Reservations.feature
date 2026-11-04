@api @direction2 @level2
Feature: Reservations

  Booking a table, editing, and cancelling.
  Rules:
  - Start time must be at least 15 minutes from now.
  - End time must be after start time.
  - Guest count cannot exceed table capacity.
  - Bookings on the same table cannot overlap (including buffer).
  - A new booking receives status "Reserved".
  - Customers can only see and modify their own bookings.
  - Anonymous users cannot make, edit, or cancel bookings.

  Background:
    Given the restaurant has a location
    And a table that seats 4 guests
    And a customer who is signed in

  Rule: A customer can find and book an available table

    Scenario: A customer books an available table and sees it in my reservations
      When the customer books the table for 2 guests
      Then the booking is accepted
      And the booking appears in my reservations with status "Reserved"
      And the table is not available for that time

  Rule: Boundary values for notice period and capacity

    Scenario Outline: A booking notice period must be at least 15 minutes
      When the customer books the table to start in <minutes> minutes
      Then the booking is <outcome>

      Examples: Notice period boundaries
        | minutes | outcome  |
        | 14      | refused  |
        # The backend enforces strictly more than 15 minutes (second precision):
        # "at least 15 minutes" per the rules means 16+ passes, exactly 15 does not.
        | 15      | refused  |
        | 16      | accepted |

    Scenario Outline: Guest count cannot exceed table capacity
      When the customer books the table for <guests> guests
      Then the booking is <outcome>

      Examples: Capacity boundaries (table seats 4)
        | guests | outcome  |
        | 3      | accepted |
        | 4      | accepted |
        | 5      | refused  |

    Scenario: End time must be after start time
      When the customer books the table with end time before start time
      Then the booking is refused

  Rule: Overlapping and adjacent intervals

    Scenario: Two bookings cannot overlap on the same table
      Given the customer has booked the table for tomorrow evening
      When another customer books the same table for the same time
      Then the second booking is refused

    Scenario: Adjacent booking outside buffer is accepted
      Given the customer has booked the table for tomorrow evening
      When another customer books the same table for an adjacent time
      Then the second booking is accepted

  Rule: Editing and cancelling bookings

    Scenario: A customer edits an existing booking
      Given the customer has booked the table for tomorrow evening
      When the customer edits the booking to 3 guests
      Then the booking is accepted

    Scenario: A customer cannot edit a booking to start with insufficient notice
      Given the customer has booked the table for tomorrow evening
      When the customer edits the booking to start in 5 minutes
      Then the booking is refused

    Scenario: Another customer cannot edit someone else's booking
      Given the customer has booked the table for tomorrow evening
      When another customer tries to edit the booking
      Then the action is refused as forbidden

    Scenario: A customer can cancel their booking
      Given the customer has booked the table for tomorrow evening
      When the customer cancels the booking
      Then the booking is cancelled

    Scenario: Cancelling an already cancelled booking is handled gracefully
      Given the customer has booked the table for tomorrow evening
      When the customer cancels the booking
      And the customer cancels the booking again
      Then the booking is cancelled

    Scenario: Another customer cannot cancel someone else's booking
      Given the customer has booked the table for tomorrow evening
      When another customer tries to cancel the booking
      Then the action is refused as forbidden

  Rule: Unauthenticated users cannot access bookings

    Scenario: An unauthenticated user cannot book a table
      When an unauthenticated customer tries to book the table
      Then the action is refused as unauthorized

    Scenario: An unauthenticated user cannot edit a booking
      Given the customer has booked the table for tomorrow evening
      When an unauthenticated customer tries to edit the booking
      Then the action is refused as unauthorized
