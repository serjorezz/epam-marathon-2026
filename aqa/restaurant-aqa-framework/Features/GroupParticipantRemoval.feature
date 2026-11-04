@direction1 @level3
Feature: Removing a participant from the group pre-order

  The owner can remove a participant from the group. The remaining participants and the recalculated
  grand total are visible immediately afterwards.

  @api
  Scenario: The owner removes one participant out of several
    Given an owner has set up a group reservation
    And a guest called Alice has joined the group
    And a guest called Bob has joined the group
    And a guest called Carol has joined the group
    And Alice adds 2 portions of menu dish 1 to her cart
    And Bob adds 1 portion of menu dish 2 to his cart
    And Carol adds 1 portion of menu dish 1 to her cart
    When the owner removes Bob from the group
    Then the group pre-order shows 2 participants
    And the participant called Bob is no longer listed
    And the grand total equals the sum of the remaining participant totals

  @api
  Scenario: The owner removes a participant who confirmed their cart
    Given an owner has set up a group reservation
    And a guest called Alice has joined the group
    And Alice adds 2 portions of menu dish 1 to her cart
    And Alice confirms her cart
    When the owner removes Alice from the group
    Then the group pre-order shows no participants
    And the grand total is 0

  @api
  Scenario: The owner removes the last participant
    Given an owner has set up a group reservation
    And a guest called Alice has joined the group
    And Alice adds 1 portion of menu dish 1 to her cart
    When the owner removes Alice from the group
    Then the group pre-order shows no participants
    And the grand total is 0

  @api @negative
  Scenario: A participant from another group cannot be removed here
    Given an owner has set up a group reservation
    And another customer called Mallory has a group reservation of their own
    And a guest called Alice has joined the owner's group
    And a guest called Bob has joined Mallory's group
    When the owner removes Bob from the group
    Then the removal is refused with "does not belong to this group reservation"

  @api @negative
  Scenario: A participant who does not exist cannot be removed
    Given an owner has set up a group reservation
    When the owner removes a participant who does not exist
    Then the request is refused as not found

  @api @negative
  Scenario: Somebody else cannot remove a participant
    Given an owner has set up a group reservation
    And a guest called Alice has joined the group
    And another customer called Mallory exists
    When Mallory removes Alice from the group
    Then the removal is refused with "Only the reservation owner can perform this action."

  # Known defect: the deployed frontend's token interceptor does not attach the owner's
  # token to /guest/* calls, so the owner's group pre-order page cannot load its data (401).
  # Green against a local build with the interceptor fix (see the README). Run with RUN_KNOWN_DEFECTS=true.
  @ui @known-defect
  Scenario: The owner removes a participant and submits the rest end to end
    Given an owner has set up a group reservation
    And a guest called Alice has joined the group
    And a guest called Bob has joined the group
    And Alice adds 2 portions of menu dish 1 to her cart
    And Bob adds 1 portion of menu dish 2 to his cart
    And Alice confirms her cart
    And Bob confirms his cart
    And the owner has prepared a pre-order for the group
    And the owner is signed in on the storefront
    When the owner opens the group pre-order page
    And the owner removes Bob from the group on the page
    Then the page no longer shows the participant called Bob
    When the owner submits the pre-order on the page
    Then the page shows the group as sent to the restaurant
    And the waiter sees the reservation's pre-order with 2 portions of menu dish 1
    And menu dish 2 is not part of the reservation's pre-order
