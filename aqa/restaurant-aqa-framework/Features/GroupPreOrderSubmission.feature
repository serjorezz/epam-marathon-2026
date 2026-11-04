@direction1 @level2
Feature: Submitting the consolidated group pre-order

  After reviewing the guests' carts the owner submits one consolidated pre-order to the restaurant.
  Only carts the guests confirmed are consolidated; identical dishes are merged with summed
  quantities; the group's pre-order becomes submitted to the restaurant.

  @api
  Scenario: The owner submits the consolidated pre-order
    Given an owner has set up a group reservation
    And a guest called Alice has joined the group
    And a guest called Bob has joined the group
    And a guest called Carol has joined the group
    And Alice adds 2 portions of menu dish 1 to her cart
    And Bob adds 1 portion of menu dish 1 to his cart
    And Carol adds 5 portions of menu dish 2 to her cart
    And Alice confirms her cart
    And Bob confirms his cart
    And the owner has prepared a pre-order for the group
    When the owner submits the group pre-order
    Then the consolidated pre-order shows 3 portions of menu dish 1
    And menu dish 2 is not part of the consolidated pre-order
    And the group pre-order is marked as sent to the restaurant
    And the reservation's pre-order is submitted to the restaurant with the consolidated composition

  @api
  Scenario: The location waiter sees the submitted order with the owner's composition
    Given an owner has set up a group reservation
    And a guest called Alice has joined the group
    And Alice adds 2 portions of menu dish 1 to her cart
    And Alice confirms her cart
    And the owner has prepared a pre-order for the group
    And the owner has submitted the group pre-order
    When the waiter checks the reservation's pre-order
    Then the waiter sees 2 portions of menu dish 1

  @api @negative
  Scenario: Submitting is refused when no guest has confirmed a cart
    Given an owner has set up a group reservation
    And a guest called Alice has joined the group
    And Alice adds 1 portion of menu dish 1 to her cart
    And the owner has prepared a pre-order for the group
    When the owner submits the group pre-order
    Then the submission is refused with "No submitted guest sessions found to consolidate."

  @api @negative
  Scenario: Submitting is refused when the reservation has no pre-order
    Given an owner has set up a group reservation
    And a guest called Alice has joined the group
    And Alice adds 1 portion of menu dish 1 to her cart
    And Alice confirms her cart
    When the owner submits the group pre-order
    Then the submission is refused with "Active pre-order for reservation not found."

  @api @negative
  Scenario: Submitting is refused when the reservation does not exist
    Given an owner has set up a group reservation
    And a guest called Alice has joined the group
    And Alice adds 1 portion of menu dish 1 to her cart
    And Alice confirms her cart
    And the owner has prepared a pre-order for the group
    When the owner submits the group pre-order of a reservation that does not exist
    Then the submission is refused with "Reservation not found."

  @api @negative
  Scenario: Submitting is refused when the group does not exist
    Given an owner has set up a group reservation
    And a guest called Alice has joined the group
    And Alice adds 1 portion of menu dish 1 to her cart
    And Alice confirms her cart
    And the owner has prepared a pre-order for the group
    When the owner submits a group pre-order that does not exist
    Then the submission is refused with "Group reservation"

  @api @negative
  Scenario: Somebody else cannot submit the group pre-order
    Given an owner has set up a group reservation
    And a guest called Alice has joined the group
    And Alice adds 1 portion of menu dish 1 to her cart
    And Alice confirms her cart
    And the owner has prepared a pre-order for the group
    And another customer called Mallory exists
    When Mallory submits the group pre-order
    Then the submission is refused with "Only the reservation owner can perform this action."

  @api
  Scenario: Submitting an already submitted group re-succeeds with the same composition
    Given an owner has set up a group reservation
    And a guest called Alice has joined the group
    And Alice adds 2 portions of menu dish 1 to her cart
    And Alice confirms her cart
    And the owner has prepared a pre-order for the group
    And the owner has submitted the group pre-order
    When the owner submits the group pre-order again
    Then the submission succeeds with the same consolidated composition
    And the group pre-order is marked as sent to the restaurant

  # Known defect: the deployed frontend's token interceptor does not attach the owner's
  # token to /guest/* calls, so the owner's group pre-order page cannot load its data (401).
  # Green against a local build with the interceptor fix (see the README). Run with RUN_KNOWN_DEFECTS=true.
  @ui @known-defect
  Scenario: The owner submits the consolidated pre-order on the page
    Given an owner has set up a group reservation
    And a guest called Alice has joined the group
    And Alice adds 2 portions of menu dish 1 to her cart
    And Alice confirms her cart
    And the owner has prepared a pre-order for the group
    And the owner is signed in on the storefront
    When the owner opens the group pre-order page
    And the owner submits the pre-order on the page
    Then the page shows the group as sent to the restaurant
