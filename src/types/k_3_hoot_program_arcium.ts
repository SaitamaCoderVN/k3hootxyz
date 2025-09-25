/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/k_3_hoot_program_arcium.json`.
 */
export type K3HootProgramArcium = {
  "address": "4K3zoVTLgNxm7eyNkHhQQUvQgoq5T4wTmrnkH7nZ6XJa",
  "metadata": {
    "name": "k3HootProgramArcium",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Arcium & Anchor"
  },
  "instructions": [
    {
      "name": "addEncryptedQuestionBlock",
      "discriminator": [
        123,
        21,
        48,
        208,
        167,
        176,
        240,
        215
      ],
      "accounts": [
        {
          "name": "questionBlock",
          "writable": true
        },
        {
          "name": "quizSet",
          "writable": true
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "questionIndex",
          "type": "u8"
        },
        {
          "name": "encryptedXCoordinate",
          "type": {
            "array": [
              "u8",
              64
            ]
          }
        },
        {
          "name": "encryptedYCoordinate",
          "type": {
            "array": [
              "u8",
              64
            ]
          }
        },
        {
          "name": "arciumPubkey",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        },
        {
          "name": "nonce",
          "type": "u128"
        }
      ]
    },
    {
      "name": "claimReward",
      "discriminator": [
        149,
        95,
        181,
        242,
        94,
        90,
        158,
        162
      ],
      "accounts": [
        {
          "name": "quizSet",
          "writable": true
        },
        {
          "name": "vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "quizSet"
              }
            ]
          }
        },
        {
          "name": "claimer",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "createQuizSet",
      "discriminator": [
        236,
        139,
        63,
        87,
        69,
        122,
        7,
        218
      ],
      "accounts": [
        {
          "name": "quizSet",
          "writable": true
        },
        {
          "name": "topic",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  111,
                  112,
                  105,
                  99
                ]
              },
              {
                "kind": "account",
                "path": "topic.name",
                "account": "topic"
              }
            ]
          }
        },
        {
          "name": "vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "quizSet"
              }
            ]
          }
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "questionCount",
          "type": "u8"
        },
        {
          "name": "uniqueId",
          "type": "u8"
        },
        {
          "name": "rewardAmount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "createTopic",
      "discriminator": [
        17,
        149,
        231,
        194,
        81,
        173,
        176,
        41
      ],
      "accounts": [
        {
          "name": "topic",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  111,
                  112,
                  105,
                  99
                ]
              },
              {
                "kind": "arg",
                "path": "name"
              }
            ]
          }
        },
        {
          "name": "owner",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "name",
          "type": "string"
        }
      ]
    },
    {
      "name": "decryptQuizCallback",
      "discriminator": [
        91,
        110,
        116,
        1,
        237,
        4,
        57,
        206
      ],
      "accounts": [
        {
          "name": "arciumProgram",
          "address": "BKck65TgoKRokMjQM3datB9oRwJ8rAj2jxPXvHXUvcL6"
        },
        {
          "name": "compDefAccount"
        },
        {
          "name": "instructionsSysvar",
          "address": "Sysvar1nstructions1111111111111111111111111"
        },
        {
          "name": "questionBlock"
        }
      ],
      "args": [
        {
          "name": "output",
          "type": {
            "defined": {
              "name": "computationOutputs",
              "generics": [
                {
                  "kind": "type",
                  "type": {
                    "defined": {
                      "name": "decryptQuizOutput"
                    }
                  }
                }
              ]
            }
          }
        }
      ]
    },
    {
      "name": "decryptQuizData",
      "discriminator": [
        234,
        73,
        186,
        65,
        213,
        119,
        47,
        34
      ],
      "accounts": [
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "signPdaAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  83,
                  105,
                  103,
                  110,
                  101,
                  114,
                  65,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              }
            ]
          }
        },
        {
          "name": "questionBlock"
        },
        {
          "name": "mxeAccount"
        },
        {
          "name": "mempoolAccount",
          "writable": true
        },
        {
          "name": "executingPool",
          "writable": true
        },
        {
          "name": "computationAccount",
          "writable": true
        },
        {
          "name": "compDefAccount"
        },
        {
          "name": "clusterAccount",
          "writable": true
        },
        {
          "name": "poolAccount",
          "writable": true,
          "address": "7MGSS4iKNM4sVib7bDZDJhVqB6EcchPwVnTKenCY1jt3"
        },
        {
          "name": "clockAccount",
          "address": "FHriyvoZotYiFnbUzKFjzRSb2NiaC8RPWY7jtKuKhg65"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "arciumProgram",
          "address": "BKck65TgoKRokMjQM3datB9oRwJ8rAj2jxPXvHXUvcL6"
        }
      ],
      "args": [
        {
          "name": "computationOffset",
          "type": "u64"
        },
        {
          "name": "encryptedData",
          "type": {
            "array": [
              "u8",
              64
            ]
          }
        },
        {
          "name": "nonce",
          "type": "u128"
        }
      ]
    },
    {
      "name": "encryptQuizCallback",
      "discriminator": [
        3,
        255,
        178,
        110,
        137,
        59,
        129,
        234
      ],
      "accounts": [
        {
          "name": "arciumProgram",
          "address": "BKck65TgoKRokMjQM3datB9oRwJ8rAj2jxPXvHXUvcL6"
        },
        {
          "name": "compDefAccount"
        },
        {
          "name": "instructionsSysvar",
          "address": "Sysvar1nstructions1111111111111111111111111"
        },
        {
          "name": "questionBlock"
        }
      ],
      "args": [
        {
          "name": "output",
          "type": {
            "defined": {
              "name": "computationOutputs",
              "generics": [
                {
                  "kind": "type",
                  "type": {
                    "defined": {
                      "name": "encryptQuizOutput"
                    }
                  }
                }
              ]
            }
          }
        }
      ]
    },
    {
      "name": "encryptQuizData",
      "discriminator": [
        240,
        26,
        99,
        12,
        39,
        36,
        224,
        42
      ],
      "accounts": [
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "signPdaAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  83,
                  105,
                  103,
                  110,
                  101,
                  114,
                  65,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              }
            ]
          }
        },
        {
          "name": "questionBlock"
        },
        {
          "name": "mxeAccount"
        },
        {
          "name": "mempoolAccount",
          "writable": true
        },
        {
          "name": "executingPool",
          "writable": true
        },
        {
          "name": "computationAccount",
          "writable": true
        },
        {
          "name": "compDefAccount"
        },
        {
          "name": "clusterAccount",
          "writable": true
        },
        {
          "name": "poolAccount",
          "writable": true,
          "address": "7MGSS4iKNM4sVib7bDZDJhVqB6EcchPwVnTKenCY1jt3"
        },
        {
          "name": "clockAccount",
          "address": "FHriyvoZotYiFnbUzKFjzRSb2NiaC8RPWY7jtKuKhg65"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "arciumProgram",
          "address": "BKck65TgoKRokMjQM3datB9oRwJ8rAj2jxPXvHXUvcL6"
        }
      ],
      "args": [
        {
          "name": "computationOffset",
          "type": "u64"
        },
        {
          "name": "questionText",
          "type": "string"
        },
        {
          "name": "options",
          "type": {
            "array": [
              "string",
              4
            ]
          }
        },
        {
          "name": "correctAnswer",
          "type": "string"
        },
        {
          "name": "nonce",
          "type": "u128"
        }
      ]
    },
    {
      "name": "getUserGlobalStats",
      "discriminator": [
        9,
        23,
        52,
        248,
        47,
        76,
        247,
        74
      ],
      "accounts": [
        {
          "name": "user"
        }
      ],
      "args": []
    },
    {
      "name": "initDecryptQuizCompDef",
      "discriminator": [
        90,
        130,
        128,
        210,
        162,
        15,
        61,
        15
      ],
      "accounts": [
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "mxeAccount",
          "writable": true
        },
        {
          "name": "compDefAccount",
          "docs": [
            "Can't check it here as it's not initialized yet."
          ],
          "writable": true
        },
        {
          "name": "arciumProgram",
          "address": "BKck65TgoKRokMjQM3datB9oRwJ8rAj2jxPXvHXUvcL6"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "initEncryptQuizCompDef",
      "discriminator": [
        190,
        97,
        25,
        211,
        26,
        49,
        64,
        189
      ],
      "accounts": [
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "mxeAccount",
          "writable": true
        },
        {
          "name": "compDefAccount",
          "docs": [
            "Can't check it here as it's not initialized yet."
          ],
          "writable": true
        },
        {
          "name": "arciumProgram",
          "address": "BKck65TgoKRokMjQM3datB9oRwJ8rAj2jxPXvHXUvcL6"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "initValidateAnswerCompDef",
      "discriminator": [
        118,
        90,
        232,
        23,
        177,
        126,
        84,
        0
      ],
      "accounts": [
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "mxeAccount",
          "writable": true
        },
        {
          "name": "compDefAccount",
          "docs": [
            "Can't check it here as it's not initialized yet."
          ],
          "writable": true
        },
        {
          "name": "arciumProgram",
          "address": "BKck65TgoKRokMjQM3datB9oRwJ8rAj2jxPXvHXUvcL6"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "recordQuizCompletion",
      "discriminator": [
        135,
        248,
        111,
        0,
        175,
        245,
        247,
        81
      ],
      "accounts": [
        {
          "name": "userScore",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114,
                  95,
                  115,
                  99,
                  111,
                  114,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "user"
              },
              {
                "kind": "account",
                "path": "topic"
              }
            ]
          }
        },
        {
          "name": "quizHistory",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  113,
                  117,
                  105,
                  122,
                  95,
                  104,
                  105,
                  115,
                  116,
                  111,
                  114,
                  121
                ]
              },
              {
                "kind": "account",
                "path": "user"
              },
              {
                "kind": "account",
                "path": "quizSet"
              },
              {
                "kind": "arg",
                "path": "timestampSeed"
              }
            ]
          }
        },
        {
          "name": "quizSet"
        },
        {
          "name": "topic",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  111,
                  112,
                  105,
                  99
                ]
              },
              {
                "kind": "account",
                "path": "topic.name",
                "account": "topic"
              }
            ]
          }
        },
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "isWinner",
          "type": "bool"
        },
        {
          "name": "score",
          "type": "u8"
        },
        {
          "name": "totalQuestions",
          "type": "u8"
        },
        {
          "name": "rewardAmount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "setWinnerForDevnet",
      "discriminator": [
        46,
        81,
        28,
        125,
        15,
        212,
        224,
        51
      ],
      "accounts": [
        {
          "name": "quizSet",
          "writable": true
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true,
          "relations": [
            "quizSet"
          ]
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "userAnswers",
          "type": {
            "vec": "string"
          }
        },
        {
          "name": "correctAnswers",
          "type": {
            "vec": "string"
          }
        }
      ]
    },
    {
      "name": "setWinnerForUser",
      "discriminator": [
        29,
        224,
        104,
        35,
        176,
        16,
        255,
        237
      ],
      "accounts": [
        {
          "name": "quizSet",
          "writable": true
        },
        {
          "name": "setter",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "winnerPubkey",
          "type": "pubkey"
        },
        {
          "name": "correctAnswersCount",
          "type": "u8"
        }
      ]
    },
    {
      "name": "toggleTopicStatus",
      "discriminator": [
        231,
        254,
        248,
        81,
        120,
        186,
        241,
        47
      ],
      "accounts": [
        {
          "name": "topic",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  111,
                  112,
                  105,
                  99
                ]
              },
              {
                "kind": "account",
                "path": "topic.name",
                "account": "topic"
              }
            ]
          }
        },
        {
          "name": "owner",
          "writable": true,
          "signer": true,
          "relations": [
            "topic"
          ]
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "isActive",
          "type": "bool"
        }
      ]
    },
    {
      "name": "transferTopicOwnership",
      "discriminator": [
        154,
        9,
        88,
        166,
        163,
        160,
        233,
        80
      ],
      "accounts": [
        {
          "name": "topic",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  111,
                  112,
                  105,
                  99
                ]
              },
              {
                "kind": "account",
                "path": "topic.name",
                "account": "topic"
              }
            ]
          }
        },
        {
          "name": "owner",
          "writable": true,
          "signer": true,
          "relations": [
            "topic"
          ]
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "newOwner",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "validateAnswerCallback",
      "discriminator": [
        242,
        143,
        241,
        66,
        101,
        128,
        174,
        58
      ],
      "accounts": [
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "arciumProgram",
          "address": "BKck65TgoKRokMjQM3datB9oRwJ8rAj2jxPXvHXUvcL6"
        },
        {
          "name": "compDefAccount"
        },
        {
          "name": "instructionsSysvar",
          "address": "Sysvar1nstructions1111111111111111111111111"
        },
        {
          "name": "questionBlock"
        },
        {
          "name": "quizSet",
          "writable": true
        }
      ],
      "args": [
        {
          "name": "output",
          "type": {
            "defined": {
              "name": "computationOutputs",
              "generics": [
                {
                  "kind": "type",
                  "type": {
                    "defined": {
                      "name": "validateAnswerOutput"
                    }
                  }
                }
              ]
            }
          }
        }
      ]
    },
    {
      "name": "validateAnswerOnchain",
      "discriminator": [
        210,
        152,
        184,
        102,
        144,
        203,
        201,
        40
      ],
      "accounts": [
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "signPdaAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  83,
                  105,
                  103,
                  110,
                  101,
                  114,
                  65,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              }
            ]
          }
        },
        {
          "name": "questionBlock"
        },
        {
          "name": "quizSet"
        },
        {
          "name": "mxeAccount"
        },
        {
          "name": "mempoolAccount",
          "writable": true
        },
        {
          "name": "executingPool",
          "writable": true
        },
        {
          "name": "computationAccount",
          "writable": true
        },
        {
          "name": "compDefAccount"
        },
        {
          "name": "clusterAccount",
          "writable": true
        },
        {
          "name": "poolAccount",
          "writable": true,
          "address": "7MGSS4iKNM4sVib7bDZDJhVqB6EcchPwVnTKenCY1jt3"
        },
        {
          "name": "clockAccount",
          "address": "FHriyvoZotYiFnbUzKFjzRSb2NiaC8RPWY7jtKuKhg65"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "arciumProgram",
          "address": "BKck65TgoKRokMjQM3datB9oRwJ8rAj2jxPXvHXUvcL6"
        }
      ],
      "args": [
        {
          "name": "computationOffset",
          "type": "u64"
        },
        {
          "name": "userAnswer",
          "type": "string"
        },
        {
          "name": "questionIndex",
          "type": "u8"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "clockAccount",
      "discriminator": [
        152,
        171,
        158,
        195,
        75,
        61,
        51,
        8
      ]
    },
    {
      "name": "cluster",
      "discriminator": [
        236,
        225,
        118,
        228,
        173,
        106,
        18,
        60
      ]
    },
    {
      "name": "computationDefinitionAccount",
      "discriminator": [
        245,
        176,
        217,
        221,
        253,
        104,
        172,
        200
      ]
    },
    {
      "name": "feePool",
      "discriminator": [
        172,
        38,
        77,
        146,
        148,
        5,
        51,
        242
      ]
    },
    {
      "name": "mxeAccount",
      "discriminator": [
        103,
        26,
        85,
        250,
        179,
        159,
        17,
        117
      ]
    },
    {
      "name": "questionBlock",
      "discriminator": [
        51,
        105,
        8,
        110,
        131,
        74,
        146,
        153
      ]
    },
    {
      "name": "quizHistory",
      "discriminator": [
        242,
        98,
        117,
        39,
        108,
        118,
        73,
        151
      ]
    },
    {
      "name": "quizSet",
      "discriminator": [
        49,
        245,
        250,
        47,
        47,
        117,
        148,
        6
      ]
    },
    {
      "name": "signerAccount",
      "discriminator": [
        127,
        212,
        7,
        180,
        17,
        50,
        249,
        193
      ]
    },
    {
      "name": "topic",
      "discriminator": [
        181,
        15,
        35,
        125,
        85,
        137,
        67,
        106
      ]
    },
    {
      "name": "userScore",
      "discriminator": [
        212,
        150,
        123,
        224,
        34,
        227,
        84,
        39
      ]
    }
  ],
  "events": [
    {
      "name": "answerVerifiedEvent",
      "discriminator": [
        206,
        99,
        216,
        213,
        165,
        7,
        21,
        237
      ]
    },
    {
      "name": "questionBlockAdded",
      "discriminator": [
        78,
        225,
        188,
        9,
        237,
        137,
        219,
        172
      ]
    },
    {
      "name": "quizCompleted",
      "discriminator": [
        61,
        139,
        98,
        57,
        151,
        244,
        119,
        244
      ]
    },
    {
      "name": "quizCompletionRecorded",
      "discriminator": [
        4,
        108,
        127,
        121,
        25,
        172,
        79,
        159
      ]
    },
    {
      "name": "quizDataDecryptedEvent",
      "discriminator": [
        216,
        227,
        12,
        4,
        55,
        145,
        151,
        101
      ]
    },
    {
      "name": "quizDataEncryptedEvent",
      "discriminator": [
        0,
        133,
        149,
        210,
        110,
        164,
        141,
        194
      ]
    },
    {
      "name": "quizSetCreated",
      "discriminator": [
        220,
        160,
        205,
        11,
        87,
        194,
        177,
        222
      ]
    },
    {
      "name": "rewardClaimed",
      "discriminator": [
        49,
        28,
        87,
        84,
        158,
        48,
        229,
        175
      ]
    },
    {
      "name": "topicCreated",
      "discriminator": [
        232,
        103,
        5,
        221,
        186,
        55,
        133,
        107
      ]
    },
    {
      "name": "topicOwnershipTransferred",
      "discriminator": [
        123,
        61,
        131,
        29,
        69,
        119,
        189,
        119
      ]
    },
    {
      "name": "topicStatusToggled",
      "discriminator": [
        105,
        66,
        121,
        198,
        160,
        166,
        153,
        185
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "emptyName",
      "msg": "Quiz set name cannot be empty"
    },
    {
      "code": 6001,
      "name": "nameTooLong",
      "msg": "Quiz set name too long (max 100 characters)"
    },
    {
      "code": 6002,
      "name": "invalidQuestionCount",
      "msg": "Invalid question count (must be 1-50)"
    },
    {
      "code": 6003,
      "name": "invalidQuestionIndex",
      "msg": "Invalid question index"
    },
    {
      "code": 6004,
      "name": "unauthorized",
      "msg": "Unauthorized to modify this quiz set"
    },
    {
      "code": 6005,
      "name": "quizSetAlreadyInitialized",
      "msg": "Quiz set already initialized"
    },
    {
      "code": 6006,
      "name": "invalidRewardAmount",
      "msg": "Invalid reward amount"
    },
    {
      "code": 6007,
      "name": "quizNotInitialized",
      "msg": "Quiz set not initialized"
    },
    {
      "code": 6008,
      "name": "quizNotCompleted",
      "msg": "Quiz not completed"
    },
    {
      "code": 6009,
      "name": "rewardAlreadyClaimed",
      "msg": "Reward already claimed"
    },
    {
      "code": 6010,
      "name": "notWinner",
      "msg": "Not the winner"
    },
    {
      "code": 6011,
      "name": "winnerAlreadySet",
      "msg": "Winner already set"
    },
    {
      "code": 6012,
      "name": "invalidAnswerCount",
      "msg": "Invalid answer count"
    },
    {
      "code": 6013,
      "name": "insufficientVaultBalance",
      "msg": "Insufficient vault balance"
    },
    {
      "code": 6014,
      "name": "topicNotActive",
      "msg": "Topic not active"
    },
    {
      "code": 6015,
      "name": "notTopicOwner",
      "msg": "Not the topic owner"
    },
    {
      "code": 6016,
      "name": "insufficientQuestions",
      "msg": "Insufficient questions for this topic"
    },
    {
      "code": 6017,
      "name": "insufficientReward",
      "msg": "Insufficient reward amount for this topic"
    }
  ],
  "types": [
    {
      "name": "activation",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "activationEpoch",
            "type": {
              "defined": {
                "name": "epoch"
              }
            }
          },
          {
            "name": "deactivationEpoch",
            "type": {
              "defined": {
                "name": "epoch"
              }
            }
          }
        ]
      }
    },
    {
      "name": "answerVerifiedEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "questionIndex",
            "type": "u32"
          },
          {
            "name": "isCorrect",
            "type": "bool"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "circuitSource",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "local",
            "fields": [
              {
                "defined": {
                  "name": "localCircuitSource"
                }
              }
            ]
          },
          {
            "name": "onChain",
            "fields": [
              {
                "defined": {
                  "name": "onChainCircuitSource"
                }
              }
            ]
          },
          {
            "name": "offChain",
            "fields": [
              {
                "defined": {
                  "name": "offChainCircuitSource"
                }
              }
            ]
          }
        ]
      }
    },
    {
      "name": "clockAccount",
      "docs": [
        "An account storing the current network epoch"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "startEpoch",
            "type": {
              "defined": {
                "name": "epoch"
              }
            }
          },
          {
            "name": "currentEpoch",
            "type": {
              "defined": {
                "name": "epoch"
              }
            }
          },
          {
            "name": "startEpochTimestamp",
            "type": {
              "defined": {
                "name": "timestamp"
              }
            }
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "cluster",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": {
              "option": "pubkey"
            }
          },
          {
            "name": "maxSize",
            "type": "u32"
          },
          {
            "name": "activation",
            "type": {
              "defined": {
                "name": "activation"
              }
            }
          },
          {
            "name": "maxCapacity",
            "type": "u64"
          },
          {
            "name": "cuPrice",
            "type": "u64"
          },
          {
            "name": "cuPriceProposals",
            "type": {
              "array": [
                "u64",
                32
              ]
            }
          },
          {
            "name": "lastUpdatedEpoch",
            "type": {
              "defined": {
                "name": "epoch"
              }
            }
          },
          {
            "name": "mxes",
            "type": {
              "vec": "pubkey"
            }
          },
          {
            "name": "nodes",
            "type": {
              "vec": {
                "defined": {
                  "name": "nodeRef"
                }
              }
            }
          },
          {
            "name": "pendingNodes",
            "type": {
              "vec": {
                "defined": {
                  "name": "nodeRef"
                }
              }
            }
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "computationDefinitionAccount",
      "docs": [
        "An account representing a [ComputationDefinition] in a MXE."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "finalizationAuthority",
            "type": {
              "option": "pubkey"
            }
          },
          {
            "name": "finalizeDuringCallback",
            "type": "bool"
          },
          {
            "name": "cuAmount",
            "type": "u64"
          },
          {
            "name": "definition",
            "type": {
              "defined": {
                "name": "computationDefinitionMeta"
              }
            }
          },
          {
            "name": "circuitSource",
            "type": {
              "defined": {
                "name": "circuitSource"
              }
            }
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "computationDefinitionMeta",
      "docs": [
        "A computation definition for execution in a MXE."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "circuitLen",
            "type": "u32"
          },
          {
            "name": "signature",
            "type": {
              "defined": {
                "name": "computationSignature"
              }
            }
          }
        ]
      }
    },
    {
      "name": "computationOutputs",
      "generics": [
        {
          "kind": "type",
          "name": "o"
        }
      ],
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "success",
            "fields": [
              {
                "generic": "o"
              }
            ]
          },
          {
            "name": "failure"
          }
        ]
      }
    },
    {
      "name": "computationSignature",
      "docs": [
        "The signature of a computation defined in a [ComputationDefinition]."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "parameters",
            "type": {
              "vec": {
                "defined": {
                  "name": "parameter"
                }
              }
            }
          },
          {
            "name": "outputs",
            "type": {
              "vec": {
                "defined": {
                  "name": "output"
                }
              }
            }
          }
        ]
      }
    },
    {
      "name": "decryptQuizOutput",
      "docs": [
        "The output of the callback instruction. Provided as a struct with ordered fields",
        "as anchor does not support tuples and tuple structs yet."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "field0",
            "type": {
              "defined": {
                "name": "sharedEncryptedStruct",
                "generics": [
                  {
                    "kind": "const",
                    "value": "64"
                  }
                ]
              }
            }
          }
        ]
      }
    },
    {
      "name": "encryptQuizOutput",
      "docs": [
        "The output of the callback instruction. Provided as a struct with ordered fields",
        "as anchor does not support tuples and tuple structs yet."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "field0",
            "type": {
              "defined": {
                "name": "sharedEncryptedStruct",
                "generics": [
                  {
                    "kind": "const",
                    "value": "64"
                  }
                ]
              }
            }
          }
        ]
      }
    },
    {
      "name": "epoch",
      "docs": [
        "The network epoch"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          "u64"
        ]
      }
    },
    {
      "name": "feePool",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "localCircuitSource",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "mxeKeygen"
          }
        ]
      }
    },
    {
      "name": "mxeAccount",
      "docs": [
        "A MPC Execution Environment."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": {
              "option": "pubkey"
            }
          },
          {
            "name": "cluster",
            "type": {
              "option": "u32"
            }
          },
          {
            "name": "x25519Pubkey",
            "type": {
              "defined": {
                "name": "x25519Pubkey"
              }
            }
          },
          {
            "name": "fallbackClusters",
            "type": {
              "vec": "u32"
            }
          },
          {
            "name": "rejectedClusters",
            "type": {
              "vec": "u32"
            }
          },
          {
            "name": "computationDefinitions",
            "type": {
              "vec": "u32"
            }
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "nodeRef",
      "docs": [
        "A reference to a node in the cluster.",
        "The offset is to derive the Node Account.",
        "The current_total_rewards is the total rewards the node has received so far in the current",
        "epoch."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "offset",
            "type": "u32"
          },
          {
            "name": "currentTotalRewards",
            "type": "u64"
          },
          {
            "name": "vote",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "offChainCircuitSource",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "source",
            "type": "string"
          },
          {
            "name": "hash",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          }
        ]
      }
    },
    {
      "name": "onChainCircuitSource",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "isCompleted",
            "type": "bool"
          },
          {
            "name": "uploadAuth",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "output",
      "docs": [
        "An output of a computation.",
        "We currently don't support encrypted outputs yet since encrypted values are passed via",
        "data objects."
      ],
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "plaintextBool"
          },
          {
            "name": "plaintextU8"
          },
          {
            "name": "plaintextU16"
          },
          {
            "name": "plaintextU32"
          },
          {
            "name": "plaintextU64"
          },
          {
            "name": "plaintextU128"
          },
          {
            "name": "ciphertext"
          },
          {
            "name": "arcisPubkey"
          },
          {
            "name": "plaintextFloat"
          }
        ]
      }
    },
    {
      "name": "parameter",
      "docs": [
        "A parameter of a computation.",
        "We differentiate between plaintext and encrypted parameters and data objects.",
        "Plaintext parameters are directly provided as their value.",
        "Encrypted parameters are provided as an offchain reference to the data.",
        "Data objects are provided as a reference to the data object account."
      ],
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "plaintextBool"
          },
          {
            "name": "plaintextU8"
          },
          {
            "name": "plaintextU16"
          },
          {
            "name": "plaintextU32"
          },
          {
            "name": "plaintextU64"
          },
          {
            "name": "plaintextU128"
          },
          {
            "name": "ciphertext"
          },
          {
            "name": "arcisPubkey"
          },
          {
            "name": "arcisSignature"
          },
          {
            "name": "plaintextFloat"
          },
          {
            "name": "manticoreAlgo"
          },
          {
            "name": "inputDataset"
          }
        ]
      }
    },
    {
      "name": "questionBlock",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "quizSet",
            "type": "pubkey"
          },
          {
            "name": "questionIndex",
            "type": "u32"
          },
          {
            "name": "encryptedXCoordinate",
            "type": {
              "array": [
                "u8",
                64
              ]
            }
          },
          {
            "name": "encryptedYCoordinate",
            "type": {
              "array": [
                "u8",
                64
              ]
            }
          },
          {
            "name": "arciumPubkey",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "nonce",
            "type": "u128"
          },
          {
            "name": "createdAt",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "questionBlockAdded",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "questionBlock",
            "type": "pubkey"
          },
          {
            "name": "quizSet",
            "type": "pubkey"
          },
          {
            "name": "questionIndex",
            "type": "u32"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "quizCompleted",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "quizSet",
            "type": "pubkey"
          },
          {
            "name": "winner",
            "type": "pubkey"
          },
          {
            "name": "rewardAmount",
            "type": "u64"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "quizCompletionRecorded",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "quizSet",
            "type": "pubkey"
          },
          {
            "name": "topic",
            "type": "pubkey"
          },
          {
            "name": "isWinner",
            "type": "bool"
          },
          {
            "name": "score",
            "type": "u8"
          },
          {
            "name": "totalQuestions",
            "type": "u8"
          },
          {
            "name": "rewardAmount",
            "type": "u64"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "quizDataDecryptedEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "decryptedData",
            "type": {
              "array": [
                "u8",
                8
              ]
            }
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "quizDataEncryptedEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "encryptedData",
            "type": {
              "array": [
                "u8",
                8
              ]
            }
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "quizHistory",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "quizSet",
            "type": "pubkey"
          },
          {
            "name": "topic",
            "type": "pubkey"
          },
          {
            "name": "completedAt",
            "type": "i64"
          },
          {
            "name": "score",
            "type": "u8"
          },
          {
            "name": "totalQuestions",
            "type": "u8"
          },
          {
            "name": "isWinner",
            "type": "bool"
          },
          {
            "name": "rewardClaimed",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "quizSet",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "topic",
            "type": "pubkey"
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "questionCount",
            "type": "u8"
          },
          {
            "name": "createdAt",
            "type": "i64"
          },
          {
            "name": "isInitialized",
            "type": "bool"
          },
          {
            "name": "rewardAmount",
            "type": "u64"
          },
          {
            "name": "isRewardClaimed",
            "type": "bool"
          },
          {
            "name": "winner",
            "type": {
              "option": "pubkey"
            }
          },
          {
            "name": "correctAnswersCount",
            "type": "u8"
          },
          {
            "name": "uniqueId",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "quizSetCreated",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "quizSet",
            "type": "pubkey"
          },
          {
            "name": "topic",
            "type": "pubkey"
          },
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "questionCount",
            "type": "u8"
          },
          {
            "name": "rewardAmount",
            "type": "u64"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "rewardClaimed",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "quizSet",
            "type": "pubkey"
          },
          {
            "name": "winner",
            "type": "pubkey"
          },
          {
            "name": "rewardAmount",
            "type": "u64"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "sharedEncryptedStruct",
      "generics": [
        {
          "kind": "const",
          "name": "len",
          "type": "usize"
        }
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "encryptionKey",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "nonce",
            "type": "u128"
          },
          {
            "name": "ciphertexts",
            "type": {
              "array": [
                {
                  "array": [
                    "u8",
                    32
                  ]
                },
                {
                  "generic": "len"
                }
              ]
            }
          }
        ]
      }
    },
    {
      "name": "signerAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "timestamp",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "timestamp",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "topic",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "createdAt",
            "type": "i64"
          },
          {
            "name": "totalQuizzes",
            "type": "u32"
          },
          {
            "name": "totalParticipants",
            "type": "u32"
          },
          {
            "name": "isActive",
            "type": "bool"
          },
          {
            "name": "minRewardAmount",
            "type": "u64"
          },
          {
            "name": "minQuestionCount",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "topicCreated",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "topic",
            "type": "pubkey"
          },
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "topicOwnershipTransferred",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "topic",
            "type": "pubkey"
          },
          {
            "name": "oldOwner",
            "type": "pubkey"
          },
          {
            "name": "newOwner",
            "type": "pubkey"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "topicStatusToggled",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "topic",
            "type": "pubkey"
          },
          {
            "name": "isActive",
            "type": "bool"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "userScore",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "topic",
            "type": "pubkey"
          },
          {
            "name": "score",
            "type": "u32"
          },
          {
            "name": "totalCompleted",
            "type": "u32"
          },
          {
            "name": "lastActivity",
            "type": "i64"
          },
          {
            "name": "totalRewards",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "validateAnswerOutput",
      "docs": [
        "The output of the callback instruction. Provided as a struct with ordered fields",
        "as anchor does not support tuples and tuple structs yet."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "field0",
            "type": {
              "defined": {
                "name": "sharedEncryptedStruct",
                "generics": [
                  {
                    "kind": "const",
                    "value": "1"
                  }
                ]
              }
            }
          }
        ]
      }
    },
    {
      "name": "x25519Pubkey",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "set",
            "fields": [
              {
                "array": [
                  "u8",
                  32
                ]
              }
            ]
          },
          {
            "name": "unset",
            "fields": [
              {
                "array": [
                  "u8",
                  32
                ]
              },
              {
                "vec": "bool"
              }
            ]
          }
        ]
      }
    }
  ]
};
