@direction2 @level1
Feature: Registration

  A visitor becomes a customer by signing up. Everyone who signs up is a customer;
  waiters and admins are never created this way. Each scenario uses a brand-new
  email address and a valid password unless it says one detail is invalid.

  Rule: A visitor can become a customer

    @api @smoke
    Scenario: A visitor registers and can then sign in
      When a visitor registers as Anna Tester with a new email address and a valid password
      Then the visitor is registered
      And the visitor can sign in with those details

  Rule: Invalid details are rejected with an explanation

    @api @negative @validation
    Scenario Outline: A visitor cannot register with an invalid detail
      When a visitor tries to register with an invalid <field> (<problem>)
      Then the visitor is told "<message>"

      @names
      Examples: First and last name rules
        | field      | problem            | message                                                              |
        | first name | too short          | First name must be between 2 and 50 characters long.                 |
        | first name | too long           | First name must be between 2 and 50 characters long.                 |
        | first name | empty              | First name must be between 2 and 50 characters long.                 |
        | first name | with digits        | First name can only contain Latin letters, hyphens, and apostrophes. |
        | last name  | too short          | Last name must be between 2 and 50 characters long.                  |
        | last name  | with an underscore | Last name can only contain Latin letters, hyphens, and apostrophes.  |

      @boundaries
      Examples: Boundary invalid name and password lengths
        | field      | problem       | message                                              |
        | first name | 1 character   | First name must be between 2 and 50 characters long. |
        | first name | 51 characters | First name must be between 2 and 50 characters long. |
        | last name  | 1 character   | Last name must be between 2 and 50 characters long.  |
        | last name  | 51 characters | Last name must be between 2 and 50 characters long.  |
        | password   | 7 characters  | Password must be between 8 and 16 characters long.   |
        | password   | 17 characters | Password must be between 8 and 16 characters long.   |

      @email
      Examples: Email address rules
        | field         | problem           | message                                                                         |
        | email address | without an @ sign | Invalid email address. Please ensure it follows the format: username@domain.com |
        | email address | without a domain  | Invalid email address. Please ensure it follows the format: username@domain.com |

      @password
      Examples: Password rules
        | field                 | problem                     | message                                            |
        | password              | too short                   | Password must be between 8 and 16 characters long. |
        | password              | too long                    | Password must be between 8 and 16 characters long. |
        | password confirmation | different from the password | Passwords do not match.                            |

  Rule: Boundary values for valid details allow registration

    @api
    Scenario Outline: A visitor can register with boundary length values
      When a visitor registers with a <field> of <length> characters
      Then the visitor is registered
      And the visitor can sign in with those details
      And the visitor is signed in as a customer

      Examples: Valid boundary lengths
        | field      | length |
        | first name | 2      |
        | first name | 50     |
        | last name  | 2      |
        | last name  | 50     |
        | password   | 8      |
        | password   | 16     |

    @api @negative
    Scenario: An email address longer than the account store supports cannot be registered
      When a visitor tries to register with an email address of 254 characters
      Then the visitor is not registered

  Rule: The sign-up form guides a visitor to a working account

    Background:
      Given a visitor is on the sign-up page

    @ui @validation
    Scenario: A visitor with valid details can submit the form
      When the visitor fills in the sign-up form with valid details
      Then the visitor can submit the form

    @ui @negative @validation
    Scenario Outline: A visitor cannot submit the form with an invalid detail
      When the visitor fills in the sign-up form with valid details
      And the visitor enters an invalid <field> (<problem>)
      Then the visitor cannot submit the form

      @names
      Examples: Name fields
        | field      | problem            |
        | first name | empty              |
        | first name | with digits        |
        | first name | too long           |
        | last name  | empty              |
        | last name  | with an underscore |

      @boundaries
      Examples: Boundary invalid lengths
        | field      | problem       |
        | first name | 51 characters |
        | last name  | 51 characters |
        | password   | 7 characters  |
        | password   | 17 characters |

      @email
      Examples: Email address field
        | field         | problem           |
        | email address | empty             |
        | email address | without an @ sign |

      @password
      Examples: Password fields
        | field                 | problem                     |
        | password              | too short                   |
        | password              | too long                    |
        | password confirmation | different from the password |

    # Known defect: frontend form lacks minLength(2) validator for names, so 1 character is accepted on UI
    @ui @negative @validation @known-defect
    Scenario Outline: A visitor cannot submit the form with a 1-character name
      When the visitor fills in the sign-up form with valid details
      And the visitor enters an invalid <field> (<problem>)
      Then the visitor cannot submit the form

      Examples:
        | field      | problem     |
        | first name | 1 character |
        | last name  | 1 character |

    @ui @negative @validation
    Scenario Outline: The form explains what is wrong with a detail
      When the visitor fills in the sign-up form with valid details
      And the visitor enters an invalid <field> (<problem>)
      Then the visitor is told "<message>"

      @names
      Examples: First name messages
        | field      | problem     | message                                                   |
        | first name | empty       | First name is required.                                   |
        | first name | too long    | First name must be up to 50 characters.                   |
        | first name | with digits | Only Latin letters, hyphens, and apostrophes are allowed. |

      # Known defect (expected to fail until fixed): the last name field shows the first name's
      # wording ("First name is required.") for its required and length messages.
      @names @known-defect
      Examples: Last name messages
        | field     | problem            | message                                                   |
        | last name | empty              | Last name is required.                                    |
        | last name | too long           | Last name must be up to 50 characters.                    |
        | last name | with an underscore | Only Latin letters, hyphens, and apostrophes are allowed. |

      @email
      Examples: Email address messages
        | field         | problem           | message                                                                         |
        | email address | empty             | Email is required.                                                              |
        | email address | without an @ sign | Invalid email address. Please ensure it follows the format: username@domain.com |

    @ui @smoke
    Scenario: A newly signed-up customer can sign in afterwards
      When a visitor signs up with valid details
      And the visitor signs in with those details
      Then the customer is signed in
