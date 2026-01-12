/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/k_3_hoot_program_arcium.json`.
 */
export type K3HootProgramArcium = {
  "address": "24MqGK5Ei8aKG6fCK8Ym36cHy1UvYD3zicRHWaEpekz4",
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
          "name": "encryptedCorrectAnswer",
          "type": {
            "array": [
              "u8",
              32
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
      "name": "finalizeGame",
      "docs": [
        "Finalize game and determine winner based on highest score"
      ],
      "discriminator": [
        203,
        227,
        3,
        167,
        186,
        102,
        76,
        10
      ],
      "accounts": [
        {
          "name": "quizSet",
          "writable": true
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true
        }
      ],
      "args": []
    },
    {
      "name": "initPlayerAnswer",
      "discriminator": [
        8,
        206,
        227,
        95,
        58,
        147,
        114,
        4
      ],
      "accounts": [
        {
          "name": "playerAnswer",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  108,
                  97,
                  121,
                  101,
                  114,
                  95,
                  97,
                  110,
                  115,
                  119,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "quizSet"
              },
              {
                "kind": "account",
                "path": "player"
              }
            ]
          }
        },
        {
          "name": "quizSet"
        },
        {
          "name": "player",
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
      "name": "updatePlayerScore",
      "docs": [
        "Update player's on-chain score (called by frontend after Arcium validation)"
      ],
      "discriminator": [
        61,
        168,
        107,
        150,
        46,
        189,
        206,
        173
      ],
      "accounts": [
        {
          "name": "quizSet",
          "writable": true
        },
        {
          "name": "playerAnswer",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  108,
                  97,
                  121,
                  101,
                  114,
                  95,
                  97,
                  110,
                  115,
                  119,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "quizSet"
              },
              {
                "kind": "account",
                "path": "player"
              }
            ]
          }
        },
        {
          "name": "player"
        },
        {
          "name": "updater",
          "writable": true,
          "signer": true
        }
      ],
      "args": [
        {
          "name": "questionIndex",
          "type": "u8"
        },
        {
          "name": "isCorrect",
          "type": "bool"
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
          "name": "encryptedUserAnswer",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        },
        {
          "name": "pubKey",
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
      "name": "playerAnswer",
      "discriminator": [
        61,
        96,
        92,
        185,
        176,
        189,
        137,
        111
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
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "invalidName",
      "msg": "Invalid quiz name"
    },
    {
      "code": 6001,
      "name": "invalidQuestionCount",
      "msg": "Invalid question count (must be 1-50)"
    },
    {
      "code": 6002,
      "name": "invalidQuestionIndex",
      "msg": "Invalid question index"
    },
    {
      "code": 6003,
      "name": "unauthorized",
      "msg": "unauthorized"
    },
    {
      "code": 6004,
      "name": "quizSetAlreadyInitialized",
      "msg": "Quiz set already initialized"
    },
    {
      "code": 6005,
      "name": "invalidRewardAmount",
      "msg": "Invalid reward amount"
    },
    {
      "code": 6006,
      "name": "quizNotInitialized",
      "msg": "Quiz not initialized"
    },
    {
      "code": 6007,
      "name": "noWinner",
      "msg": "No winner yet"
    },
    {
      "code": 6008,
      "name": "rewardAlreadyClaimed",
      "msg": "Reward already claimed"
    },
    {
      "code": 6009,
      "name": "notWinner",
      "msg": "Not the winner"
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
      "name": "playerAnswer",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "quizSet",
            "type": "pubkey"
          },
          {
            "name": "player",
            "type": "pubkey"
          },
          {
            "name": "totalScore",
            "type": "u64"
          },
          {
            "name": "correctCount",
            "type": "u8"
          },
          {
            "name": "lastUpdated",
            "type": "i64"
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
            "name": "encryptedCorrectAnswer",
            "type": {
              "array": [
                "u8",
                32
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
      "name": "quizSet",
      "type": {
        "kind": "struct",
        "fields": [
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
