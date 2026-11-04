@direction1 @level1
Feature: Group pre-order participants

  The owner of a group reservation shares an invite link; guests join and build their own carts.
  The owner needs to see who joined, what each guest ordered, and what everything costs together.

  @api
  Scenario: The owner sees every participant with their dishes and totals
    Given an owner has set up a group reservation
    And a guest called Alice has joined the group
    And a guest called Bob has joined the group
    And Alice adds 2 portions of menu dish 1 to her cart
    And Alice adds 1 portion of menu dish 2 to her cart
    And Bob adds 1 portion of menu dish 1 to his cart
    When the owner checks the group pre-order
    Then the group pre-order shows 2 participants
    And the participant called Alice has 2 dishes with the quantities they ordered
    And the participant called Bob has 1 dish with the quantity they ordered
    And each participant total matches the value of their cart
    And the grand total equals the sum of the participant totals

  @api
  Scenario: The grand total changes when a guest changes their cart
    Given an owner has set up a group reservation
    And a guest called Alice has joined the group
    And Alice adds 1 portion of menu dish 1 to her cart
    When Alice removes menu dish 1 from her cart
    Then the grand total is 0

  @api
  Scenario: A guest who has not confirmed their cart is marked as still choosing
    Given an owner has set up a group reservation
    And a guest called Alice has joined the group
    And Alice adds 1 portion of menu dish 1 to her cart
    When the owner checks the group pre-order
    Then the participant called Alice is marked as still choosing

  @api
  Scenario: A guest who joined without ordering is still listed
    Given an owner has set up a group reservation
    And a guest called Alice has joined the group
    When the owner checks the group pre-order
    Then the group pre-order shows 1 participant
    And the participant called Alice has no dishes

  @api
  Scenario: Nobody has joined the group yet
    Given an owner has set up a group reservation
    When the owner checks the group pre-order
    Then the group pre-order shows no participants
    And the grand total is 0

  @api @negative
  Scenario: Another customer cannot see the participant list
    Given an owner has set up a group reservation
    And another customer called Mallory exists
    When Mallory tries to check the group pre-order
    Then the request is refused as forbidden

  @api @negative
  Scenario: A guest of the group cannot see the participant list
    Given an owner has set up a group reservation
    And a guest called Alice has joined the group
    When Alice tries to check the group pre-order
    Then the request is refused as unauthorized

  @api @negative
  Scenario: The location waiter cannot see the participant list
    Given an owner has set up a group reservation
    When the waiter tries to check the group pre-order
    Then the request is refused as forbidden

  @api @negative
  Scenario: An anonymous visitor cannot see the participant list
    Given an owner has set up a group reservation
    When an anonymous visitor tries to check the group pre-order
    Then the request is refused as unauthorized

  @api @negative
  Scenario: The group does not exist
    Given an owner has set up a group reservation
    When the owner checks a group pre-order that does not exist
    Then the request is refused as not found

  # Known defect: the deployed frontend's token interceptor does not attach the owner's
  # token to /guest/* calls, so the owner's group pre-order page cannot load its data (401).
  # Green against a local build with the interceptor fix (see the README). Run with RUN_KNOWN_DEFECTS=true.
  @ui @known-defect
  Scenario: The owner reviews the participants on the group pre-order page
    Given an owner has set up a group reservation
    And a guest called Alice has joined the group
    And Alice adds 2 portions of menu dish 1 to her cart
    And the owner is signed in on the storefront
    When the owner opens the group pre-order page
    Then the page lists 1 participant
    And the page shows the participant called Alice as still choosing
    And the page's participant subtotals add up to the service grand total

  @ui
  Scenario: A guest joins through the invite link and confirms their pre-order
    Given an owner has set up a group reservation
    When a guest called Alice opens the invite link
    And Alice adds the first menu dish to her cart
    And Alice confirms her pre-order
    Then Alice sees that her pre-order was submitted
    And the owner sees Alice's cart among the participants
