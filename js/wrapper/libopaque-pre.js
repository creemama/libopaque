(function (root) {
  "use strict";

  function wrapLibrary(Module) {
    Module["crypto_auth_hmacsha256_BYTES"] = Module.cwrap(
      "opaquejs_crypto_auth_hmacsha256_BYTES",
      "number"
    )();
    Module["crypto_core_ristretto255_BYTES"] = Module.cwrap(
      "opaquejs_crypto_core_ristretto255_BYTES",
      "number"
    )();
    Module["crypto_hash_sha256_BYTES"] = Module.cwrap(
      "opaquejs_crypto_hash_sha256_BYTES",
      "number"
    )();
    Module["crypto_scalarmult_BYTES"] = Module.cwrap(
      "opaquejs_crypto_scalarmult_BYTES",
      "number"
    )();
    Module["crypto_scalarmult_SCALARBYTES"] = Module.cwrap(
      "opaquejs_crypto_scalarmult_SCALARBYTES",
      "number"
    )();
    Module["crypto_secretbox_KEYBYTES"] = Module.cwrap(
      "opaquejs_crypto_secretbox_KEYBYTES",
      "number"
    )();
    Module["OPAQUE_USER_RECORD_LEN"] = Module.cwrap(
      "opaquejs_OPAQUE_USER_RECORD_LEN",
      "number"
    )();
    Module["OPAQUE_REGISTER_PUBLIC_LEN"] = Module.cwrap(
      "opaquejs_OPAQUE_REGISTER_PUBLIC_LEN",
      "number"
    )();
    Module["OPAQUE_REGISTER_SECRET_LEN"] = Module.cwrap(
      "opaquejs_OPAQUE_REGISTER_SECRET_LEN",
      "number"
    )();
    Module["OPAQUE_SERVER_SESSION_LEN"] = Module.cwrap(
      "opaquejs_OPAQUE_SERVER_SESSION_LEN",
      "number"
    )();
    Module["OPAQUE_REGISTER_USER_SEC_LEN"] = Module.cwrap(
      "opaquejs_OPAQUE_REGISTER_USER_SEC_LEN",
      "number"
    )();
    Module["OPAQUE_USER_SESSION_PUBLIC_LEN"] = Module.cwrap(
      "opaquejs_OPAQUE_USER_SESSION_PUBLIC_LEN",
      "number"
    )();
    Module["OPAQUE_USER_SESSION_SECRET_LEN"] = Module.cwrap(
      "opaquejs_OPAQUE_USER_SESSION_SECRET_LEN",
      "number"
    )();
    Module["OPAQUE_SERVER_AUTH_CTX_LEN"] = Module.cwrap(
      "opaquejs_OPAQUE_SERVER_AUTH_CTX_LEN",
      "number"
    )();

    Module["NotPackaged"] = 0;
    Module["InSecEnv"] = 1;
    Module["InClrEnv"] = 2;

    Module["genServerKeyPair"] = () => {
      return genServerKeyPair(Module);
    };
    Module["GenServerKeyPair"] = Module.cwrap(
      "opaquejs_GenServerKeyPair",
      "number",
      [
        "number", // uint8_t pkS[crypto_scalarmult_BYTES]
        "number", // uint8_t skS[crypto_scalarmult_SCALARBYTES]
      ]
    );
    function genServerKeyPair(module) {
      const pointers = [];
      try {
        const pkS_pointer = new AllocatedBuf(
          module.crypto_scalarmult_BYTES,
          module
        );
        pointers.push(pkS_pointer);
        const skS_pointer = new AllocatedBuf(
          module.crypto_scalarmult_SCALARBYTES,
          module
        );
        pointers.push(skS_pointer);
        if (
          0 !==
          module.GenServerKeyPair(pkS_pointer.address, skS_pointer.address)
        ) {
          const error = new Error("GenServerKeyPair failed.");
          error.name = "OpaqueError";
          throw error;
        }
        return {
          pkS: pkS_pointer.toUint8Array(),
          skS: skS_pointer.toUint8Array(),
        };
      } catch (e) {
        if (e.name === "OpaqueError") throw e;
        const error = new Error(
          "genServerKeyPair failed. (" + e.name + ") " + e.message
        );
        error.name = "OpaqueError";
        error.cause = e;
        throw error;
      } finally {
        zeroAndFree(pointers);
      }
    }

    Module["register"] = (params) => {
      return register(Module, params);
    };
    Module["Register"] = Module.cwrap("opaquejs_Register", "number", [
      "string", // const uint8_t *pwdU,
      "number", // const uint16_t pwdU_len,
      "number", // const uint8_t skS[crypto_scalarmult_SCALARBYTES],
      "number", // const uint8_t cfg_skU,
      "number", // const uint8_t cfg_pkU,
      "number", // const uint8_t cfg_pkS,
      "number", // const uint8_t cfg_idS,
      "number", // const uint8_t cfg_idU,
      "string", // const uint8_t *ids_idU,
      "number", // const uint16_t ids_idU_len,
      "string", // const uint8_t *ids_idS,
      "number", // const uint16_t ids_idS_len,
      "number", // uint8_t rec[OPAQUE_USER_RECORD_LEN/*+envU_len*/],
      "number", // uint8_t export_key[crypto_hash_sha256_BYTES]);
    ]);
    function register(module, params) {
      const pointers = [];
      try {
        const {
          pwdU, // required
          skS, // optional
          cfg, // required
          ids, // required
        } = params;
        validateRequiredStrings({ pwdU });
        validateRequiredStrings(ids);
        validatePkgConfig(cfg);
        const pwdU_len = pwdU.length;

        let skS_pointer;
        if (skS != null) {
          validateUint8Arrays({ skS });
          skS_pointer = AllocatedBuf.fromUint8Array(
            skS,
            module.crypto_scalarmult_SCALARBYTES,
            module
          );
          pointers.push(skS_pointer);
        }

        const envU_len = module.getEnvelopeLen({ cfg, ids });
        const rec_pointer = new AllocatedBuf(
          module.OPAQUE_USER_RECORD_LEN + envU_len,
          module
        );
        pointers.push(rec_pointer);
        const export_key_pointer = new AllocatedBuf(
          module.crypto_hash_sha256_BYTES,
          module
        );
        pointers.push(export_key_pointer);

        if (
          0 !==
          module.Register(
            pwdU,
            pwdU_len,
            skS_pointer ? skS_pointer.address : null,
            cfg.skU,
            cfg.pkU,
            cfg.pkS,
            cfg.idS,
            cfg.idU,
            ids.idU,
            ids.idU.length,
            ids.idS,
            ids.idS.length,
            rec_pointer.address,
            export_key_pointer.address
          )
        ) {
          const error = new Error("Register failed.");
          error.name = "OpaqueError";
          throw error;
        }
        return {
          rec: rec_pointer.toUint8Array(),
          export_key: export_key_pointer.toUint8Array(),
        };
      } catch (e) {
        if (e.name === "OpaqueError") throw e;
        const error = new Error(
          "register failed. (" + e.name + ") " + e.message
        );
        error.name = "OpaqueError";
        error.cause = e;
        throw error;
      } finally {
        zeroAndFree(pointers);
      }
    }

    Module["createCredentialRequest"] = (params) => {
      return createCredentialRequest(Module, params);
    };
    Module["CreateCredentialRequest"] = Module.cwrap(
      "opaquejs_CreateCredentialRequest",
      "number",
      [
        "string", // const uint8_t *pwdU,
        "number", // const uint16_t pwdU_len,
        "number", // uint8_t sec[OPAQUE_USER_SESSION_SECRET_LEN+pwdU_len],
        "number", // uint8_t pub[OPAQUE_USER_SESSION_PUBLIC_LEN]);
      ]
    );
    function createCredentialRequest(module, params) {
      const pointers = [];
      try {
        const { pwdU } = params; // required
        validateRequiredStrings({ pwdU });
        const pwdU_len = pwdU.length;
        const sec_pointer = new AllocatedBuf(
          module.OPAQUE_USER_SESSION_SECRET_LEN + pwdU.length,
          module
        );
        pointers.push(sec_pointer);
        const pub_pointer = new AllocatedBuf(
          module.OPAQUE_USER_SESSION_PUBLIC_LEN,
          module
        );
        pointers.push(pub_pointer);
        if (
          0 !==
          module.CreateCredentialRequest(
            pwdU,
            pwdU_len,
            sec_pointer.address,
            pub_pointer.address
          )
        ) {
          const error = new Error("CreateCredentialRequest failed.");
          error.name = "OpaqueError";
          throw error;
        }
        return {
          sec: sec_pointer.toUint8Array(),
          pub: pub_pointer.toUint8Array(),
        };
      } catch (e) {
        if (e.name === "OpaqueError") throw e;
        const error = new Error(
          "createCredentialRequest failed. (" + e.name + ") " + e.message
        );
        error.name = "OpaqueError";
        error.cause = e;
        throw error;
      } finally {
        zeroAndFree(pointers);
      }
    }

    Module["createCredentialResponse"] = (params) => {
      return createCredentialResponse(Module, params);
    };
    Module["CreateCredentialResponse"] = Module.cwrap(
      "opaquejs_CreateCredentialResponse",
      "number",
      [
        "number", // const uint8_t pub[OPAQUE_USER_SESSION_PUBLIC_LEN],
        "number", // const uint8_t rec[OPAQUE_USER_RECORD_LEN/*+envU_len*/],
        "string", // const uint8_t *ids_idU,
        "number", // const uint16_t ids_idU_len,
        "string", // const uint8_t *ids_idS,
        "number", // const uint16_t ids_idS_len,
        "string", // const uint8_t *app_info1,
        "number", // const size_t app_info1_len,
        "string", // const uint8_t *app_info2,
        "number", // const size_t app_info2_len,
        "string", // const uint8_t *app_einfo2,
        "number", // const size_t app_einfo2_len,
        "string", // const uint8_t *app_info3,
        "number", // const size_t app_info3_len,
        "string", // const uint8_t *app_einfo3,
        "number", // const size_t app_einfo3_len,
        "number", // uint8_t resp[OPAQUE_SERVER_SESSION_LEN/*+envU_len*/],
        "number", // uint8_t sk[crypto_secretbox_KEYBYTES],
        "number", // uint8_t sec[OPAQUE_SERVER_AUTH_CTX_LEN]);
      ]
    );
    function createCredentialResponse(module, params) {
      const pointers = [];
      try {
        const {
          pub, // required
          rec, // required
          cfg, // required
          ids, // required
          infos, // optional
        } = params;
        const app_info = infos || {};
        validateUint8Arrays({ pub, rec });
        validateRequiredStrings(ids);
        validateOptionalStrings(app_info);
        validatePkgConfig(cfg);

        const pub_pointer = AllocatedBuf.fromUint8Array(
          pub,
          module.OPAQUE_USER_SESSION_PUBLIC_LEN,
          module
        );
        pointers.push(pub_pointer);
        const envU_len = module.getEnvelopeLen({ cfg, ids });
        const rec_pointer = AllocatedBuf.fromUint8Array(
          rec,
          module.OPAQUE_USER_RECORD_LEN + envU_len,
          module
        );
        pointers.push(rec_pointer);

        const resp_pointer = new AllocatedBuf(
          module.OPAQUE_SERVER_SESSION_LEN + envU_len,
          module
        );
        pointers.push(resp_pointer);
        const sk_pointer = new AllocatedBuf(
          module.crypto_secretbox_KEYBYTES,
          module
        );
        pointers.push(sk_pointer);
        const sec_pointer = new AllocatedBuf(
          module.OPAQUE_SERVER_AUTH_CTX_LEN,
          module
        );
        pointers.push(sec_pointer);
        sec_pointer.zero();

        if (
          0 !==
          module.CreateCredentialResponse(
            pub_pointer.address,
            rec_pointer.address,
            ids.idU,
            ids.idU.length,
            ids.idS,
            ids.idS.length,
            app_info.info1,
            app_info.info1 != null ? app_info.info1.length : 0,
            app_info.info2,
            app_info.info2 != null ? app_info.info2.length : 0,
            app_info.einfo2,
            app_info.einfo2 != null ? app_info.einfo2.length : 0,
            app_info.info3,
            app_info.info3 != null ? app_info.info3.length : 0,
            app_info.einfo3,
            app_info.einfo3 != null ? app_info.einfo3.length : 0,
            resp_pointer.address,
            sk_pointer.address,
            sec_pointer.address
          )
        ) {
          const error = new Error("CreateCredentialResponse failed.");
          error.name = "OpaqueError";
          throw error;
        }
        return {
          resp: resp_pointer.toUint8Array(),
          sk: sk_pointer.toUint8Array(),
          sec: sec_pointer.toUint8Array(),
        };
      } catch (e) {
        if (e.name === "OpaqueError") throw e;
        const error = new Error(
          "createCredentialResponse failed. (" + e.name + ") " + e.message
        );
        error.name = "OpaqueError";
        error.cause = e;
        throw error;
      } finally {
        zeroAndFree(pointers);
      }
    }

    Module["recoverCredentials"] = (params) => {
      return recoverCredentials(Module, params);
    };
    Module["RecoverCredentials"] = Module.cwrap(
      "opaquejs_RecoverCredentials",
      "number",
      [
        "number", // const uint8_t resp[OPAQUE_SERVER_SESSION_LEN/*+envU_len*/],
        "number", // const uint8_t sec[OPAQUE_USER_SESSION_SECRET_LEN/*+pwdU_len*/],
        "number", // const uint8_t pkS[crypto_scalarmult_BYTES],
        "number", // const uint8_t cfg_skU,
        "number", // const uint8_t cfg_pkU,
        "number", // const uint8_t cfg_pkS,
        "number", // const uint8_t cfg_idS,
        "number", // const uint8_t cfg_idU,
        "string", // const uint8_t *app_info1,
        "number", // const size_t app_info1_len,
        "string", // const uint8_t *app_info2,
        "number", // const size_t app_info2_len,
        "string", // const uint8_t *app_einfo2,
        "number", // const size_t app_einfo2_len,
        "string", // const uint8_t *app_info3,
        "number", // const size_t app_info3_len,
        "string", // const uint8_t *app_einfo3,
        "number", // const size_t app_einfo3_len,
        "number", // const uint8_t **ids_idU,
        "number", // const uint16_t *ids_idU_len,
        "number", // const uint8_t **ids_idS,
        "number", // const uint16_t *ids_idS_len,
        "number", // uint8_t *sk,
        "number", // uint8_t authU[crypto_auth_hmacsha256_BYTES],
        "number", // uint8_t export_key[crypto_hash_sha256_BYTES]);
      ]
    );
    function recoverCredentials(module, params) {
      const pointers = [];
      try {
        const {
          resp, // required
          sec, // required
          pkS, // optional (required if cfg_pkS == NotPackaged)
          cfg, // required
          infos, // optional
          ids, // optional (required if cfg_idU == NotPackaged or cfg_idS == NotPackaged)
          max_ids_idU_len, // optional (only applicable if cfg_idU != NotPackaged; the default is 64)
          max_ids_idS_len, // optional (only applicable if cfg_idU != NotPackaged; the default is 64)
        } = params;
        const app_info = infos || {};
        validateUint8Arrays({ resp, sec });
        validateOptionalStrings(app_info);
        validatePkgConfig(cfg);

        const resp_pointer = AllocatedBuf.fromUint8ArrayInexact(
          resp,
          module.OPAQUE_SERVER_SESSION_LEN /*+envU_len*/,
          module
        );
        pointers.push(resp_pointer);
        const sec_pointer = AllocatedBuf.fromUint8ArrayInexact(
          sec,
          module.OPAQUE_USER_SESSION_SECRET_LEN /*+pwdU_len*/,
          module
        );
        pointers.push(sec_pointer);

        let pkS_pointer;
        if (cfg.pkS == module.NotPackaged) {
          validateUint8Arrays({ pkS });
          pkS_pointer = AllocatedBuf.fromUint8Array(
            pkS,
            module.crypto_scalarmult_BYTES,
            module
          );
          pointers.push(pkS_pointer);
        }

        // uint16_t has 16 bits = 2 bytes.
        const ids1_idU_len_pointer = new AllocatedBuf(2, module);
        pointers.push(ids1_idU_len_pointer);
        const ids1_idS_len_pointer = new AllocatedBuf(2, module);
        pointers.push(ids1_idS_len_pointer);
        // 32 bits handles the maximum memory size in bytes (2 GB = 2147483648
        // bytes). See
        // https://github.com/emscripten-core/emscripten/blob/2.0.11/src/settings.js .
        // 32 bits = 4 bytes.
        const ids1_idU_pointer_pointer = new AllocatedBuf(4, module);
        pointers.push(ids1_idU_pointer_pointer);
        const ids1_idS_pointer_pointer = new AllocatedBuf(4, module);
        pointers.push(ids1_idS_pointer_pointer);

        // If the IDs are not in the envelope, we must provide them beforehand. If
        // they are in the envelope, we use the IDs in the envelope.
        let ids1_idU_pointer;
        if (cfg.idU === module.NotPackaged) {
          validateRequiredStrings({ ids_idU: ids.idU });
          module.setValue(ids1_idU_len_pointer.address, ids.idU.length, "i16");
          // ccall uses stringToUTF8 for string arguments. See
          // https://github.com/emscripten-core/emscripten/blob/2.0.11/src/preamble.js.
          // At most there are 4 bytes per UTF-8 code point. Add +1 for the
          // trailing '\0'.
          ids1_idU_pointer = new AllocatedBuf(
            (ids.idU.length << 2) + 1,
            module
          );
          pointers.push(ids1_idU_pointer);
          module.stringToUTF8(
            ids.idU,
            ids1_idU_pointer.address,
            ids1_idU_pointer.length
          );
        } else {
          // ids1_idU_pointer must be big enough to fit idU.
          const ids1_idU_len =
            Number.isInteger(max_ids_idU_len) && max_ids_idU_len > 0
              ? max_ids_idU_len
              : 64;
          module.setValue(ids1_idU_len_pointer.address, ids1_idU_len, "i16");
          ids1_idU_pointer = new AllocatedBuf(ids1_idU_len, module);
          pointers.push(ids1_idU_pointer);
        }
        module.setValue(
          ids1_idU_pointer_pointer.address,
          ids1_idU_pointer.address,
          "i32"
        );

        let ids1_idS_pointer;
        if (cfg.idS === module.NotPackaged) {
          validateRequiredStrings({ ids_idS: ids.idS });
          let ids_idS_len = ids.idS.length;
          module.setValue(ids1_idS_len_pointer.address, ids_idS_len, "i16");
          // ccall uses stringToUTF8 for string arguments. See
          // https://github.com/emscripten-core/emscripten/blob/2.0.11/src/preamble.js.
          // At most there are 4 bytes per UTF-8 code point. Add +1 for the
          // trailing '\0'.
          ids1_idS_pointer = new AllocatedBuf(
            (ids.idS.length << 2) + 1,
            module
          );
          pointers.push(ids1_idS_pointer);
          module.stringToUTF8(
            ids.idS,
            ids1_idS_pointer.address,
            ids1_idS_pointer.length
          );
        } else {
          // ids1_idS_pointer must be big enough to fit idS.
          const ids1_idS_len =
            Number.isInteger(max_ids_idS_len) && max_ids_idS_len > 0
              ? max_ids_idS_len
              : 64;
          module.setValue(ids1_idS_len_pointer.address, ids1_idS_len, "i16");
          ids1_idS_pointer = new AllocatedBuf(ids1_idS_len, module);
          pointers.push(ids1_idS_pointer);
        }
        module.setValue(
          ids1_idS_pointer_pointer.address,
          ids1_idS_pointer.address,
          "i32"
        );

        const sk_pointer = new AllocatedBuf(
          module.crypto_secretbox_KEYBYTES,
          module
        );
        pointers.push(sk_pointer);
        const authU_pointer = new AllocatedBuf(
          module.crypto_auth_hmacsha256_BYTES,
          module
        );
        pointers.push(authU_pointer);
        const export_key_pointer = new AllocatedBuf(
          module.crypto_hash_sha256_BYTES,
          module
        );
        pointers.push(export_key_pointer);

        if (
          0 !==
          module.RecoverCredentials(
            resp_pointer.address,
            sec_pointer.address,
            pkS_pointer ? pkS_pointer.address : null,
            cfg.skU,
            cfg.pkU,
            cfg.pkS,
            cfg.idS,
            cfg.idU,
            app_info.info1,
            app_info.info1 != null ? app_info.info1.length : 0,
            app_info.info2,
            app_info.info2 != null ? app_info.info2.length : 0,
            app_info.einfo2,
            app_info.einfo2 != null ? app_info.einfo2.length : 0,
            app_info.info3,
            app_info.info3 != null ? app_info.info3.length : 0,
            app_info.einfo3,
            app_info.einfo3 != null ? app_info.einfo3.length : 0,
            ids1_idU_pointer_pointer.address,
            ids1_idU_len_pointer.address,
            ids1_idS_pointer_pointer.address,
            ids1_idS_len_pointer.address,
            sk_pointer.address,
            authU_pointer.address,
            export_key_pointer.address
          )
        ) {
          const error = new Error("RecoverCredentials failed.");
          error.name = "OpaqueError";
          throw error;
        }
        return {
          ids: {
            idU: module.UTF8ToString(
              ids1_idU_pointer.address,
              module.getValue(ids1_idU_len_pointer.address, "i16")
            ),
            idS: module.UTF8ToString(
              ids1_idS_pointer.address,
              module.getValue(ids1_idS_len_pointer.address, "i16")
            ),
          },
          sk: sk_pointer.toUint8Array(),
          authU: authU_pointer.toUint8Array(),
          export_key: export_key_pointer.toUint8Array(),
        };
      } catch (e) {
        if (e.name === "OpaqueError") throw e;
        const error = new Error(
          "recoverCredentials failed. (" + e.name + ") " + e.message
        );
        error.name = "OpaqueError";
        error.cause = e;
        throw error;
      } finally {
        zeroAndFree(pointers);
      }
    }

    Module["userAuth"] = (params) => {
      return userAuth(Module, params);
    };
    Module["UserAuth"] = Module.cwrap("opaquejs_UserAuth", "number", [
      "number", // uint8_t sec[OPAQUE_SERVER_AUTH_CTX_LEN],
      "number", // const uint8_t authU[crypto_auth_hmacsha256_BYTES],
      "string", // const uint8_t *app_info3,
      "number", // const size_t app_info3_len,
      "string", // const uint8_t *app_einfo3,
      "number", // const size_t app_einfo3_len);
    ]);
    function userAuth(module, params) {
      const pointers = [];
      try {
        const {
          sec, // required
          authU, // required
          infos, // optional
        } = params;
        const app_info = infos || {};
        validateUint8Arrays({ sec, authU });
        validateOptionalStrings({
          app_info3: app_info.info3,
          app_einfo3: app_info.einfo3,
        });
        const sec_pointer = AllocatedBuf.fromUint8Array(
          sec,
          module.OPAQUE_SERVER_AUTH_CTX_LEN,
          module
        );
        pointers.push(sec_pointer);
        const authU_pointer = AllocatedBuf.fromUint8Array(
          authU,
          module.crypto_auth_hmacsha256_BYTES,
          module
        );
        pointers.push(authU_pointer);
        return (
          0 ===
          module.UserAuth(
            sec_pointer.address,
            authU_pointer.address,
            app_info.info3,
            app_info.info3 != null ? app_info.info3.length : 0,
            app_info.einfo3,
            app_info.einfo3 != null ? app_info.einfo3.length : 0
          )
        );
      } catch (e) {
        if (e.name === "OpaqueError") throw e;
        const error = new Error(
          "userAuth failed. (" + e.name + ") " + e.message
        );
        error.name = "OpaqueError";
        error.cause = e;
        throw error;
      } finally {
        zeroAndFree(pointers);
      }
    }

    Module["createRegistrationRequest"] = (params) => {
      return createRegistrationRequest(Module, params);
    };
    Module["CreateRegistrationRequest"] = Module.cwrap(
      "opaquejs_CreateRegistrationRequest",
      "number",
      [
        "string", // const uint8_t *pwdU,
        "number", // const uint16_t pwdU_len,
        "number", // uint8_t sec[OPAQUE_REGISTER_USER_SEC_LEN+pwdU_len],
        "number", // uint8_t M[crypto_core_ristretto255_BYTES]);
      ]
    );
    function createRegistrationRequest(module, params) {
      const pointers = [];
      try {
        const { pwdU } = params; // required
        validateRequiredStrings({ pwdU });
        const pwdU_len = pwdU.length;
        const sec_pointer = new AllocatedBuf(
          module.OPAQUE_REGISTER_USER_SEC_LEN + pwdU_len,
          module
        );
        pointers.push(sec_pointer);
        const M_pointer = new AllocatedBuf(
          module.crypto_core_ristretto255_BYTES,
          module
        );
        pointers.push(M_pointer);
        if (
          0 !==
          module.CreateRegistrationRequest(
            pwdU,
            pwdU_len,
            sec_pointer.address,
            M_pointer.address
          )
        ) {
          const error = new Error("CreateRegistrationRequest failed.");
          error.name = "OpaqueError";
          throw error;
        }
        return {
          sec: sec_pointer.toUint8Array(),
          M: M_pointer.toUint8Array(),
        };
      } catch (e) {
        if (e.name === "OpaqueError") throw e;
        const error = new Error(
          "createRegistrationRequest failed. (" + e.name + ") " + e.message
        );
        error.name = "OpaqueError";
        error.cause = e;
        throw error;
      } finally {
        zeroAndFree(pointers);
      }
    }

    Module["createRegistrationResponse"] = (params) => {
      return createRegistrationResponse(Module, params);
    };
    Module["CreateRegistrationResponse"] = Module.cwrap(
      "opaquejs_CreateRegistrationResponse",
      "number",
      [
        "number", // const uint8_t M[crypto_core_ristretto255_BYTES],
        "number", // uint8_t sec[OPAQUE_REGISTER_SECRET_LEN],
        "number", // uint8_t pub[OPAQUE_REGISTER_PUBLIC_LEN]);
      ]
    );
    function createRegistrationResponse(module, params) {
      const pointers = [];
      try {
        const { M } = params; // required
        validateUint8Arrays({ M });
        const M_pointer = AllocatedBuf.fromUint8Array(
          M,
          module.crypto_core_ristretto255_BYTES,
          module
        );
        pointers.push(M_pointer);
        const sec_pointer = new AllocatedBuf(
          module.OPAQUE_REGISTER_SECRET_LEN,
          module
        );
        pointers.push(sec_pointer);
        const pub_pointer = new AllocatedBuf(
          module.OPAQUE_REGISTER_PUBLIC_LEN,
          module
        );
        pointers.push(pub_pointer);
        if (
          0 !==
          module.CreateRegistrationResponse(
            M_pointer.address,
            sec_pointer.address,
            pub_pointer.address
          )
        ) {
          const error = new Error("CreateRegistrationResponse failed.");
          error.name = "OpaqueError";
          throw error;
        }
        return {
          sec: sec_pointer.toUint8Array(),
          pub: pub_pointer.toUint8Array(),
        };
      } catch (e) {
        if (e.name === "OpaqueError") throw e;
        const error = new Error(
          "createRegistrationResponse failed. (" + e.name + ") " + e.message
        );
        error.name = "OpaqueError";
        error.cause = e;
        throw error;
      } finally {
        zeroAndFree(pointers);
      }
    }

    Module["create1kRegistrationResponse"] = (params) => {
      return create1kRegistrationResponse(Module, params);
    };
    Module["Create1kRegistrationResponse"] = Module.cwrap(
      "opaquejs_Create1kRegistrationResponse",
      "number",
      [
        "number", // const uint8_t M[crypto_core_ristretto255_BYTES],
        "number", // const uint8_t pkS[crypto_scalarmult_BYTES],
        "number", // uint8_t sec[OPAQUE_REGISTER_SECRET_LEN],
        "number", // uint8_t pub[OPAQUE_REGISTER_PUBLIC_LEN]);
      ]
    );
    function create1kRegistrationResponse(module, params) {
      const pointers = [];
      try {
        const {
          M, // required
          pkS, // required
        } = params;
        validateUint8Arrays({ M, pkS });
        const M_pointer = AllocatedBuf.fromUint8Array(
          M,
          module.crypto_core_ristretto255_BYTES,
          module
        );
        pointers.push(M_pointer);
        const pkS_pointer = AllocatedBuf.fromUint8Array(
          pkS,
          module.crypto_scalarmult_BYTES,
          module
        );
        pointers.push(pkS_pointer);
        const sec_pointer = new AllocatedBuf(
          module.OPAQUE_REGISTER_SECRET_LEN,
          module
        );
        pointers.push(sec_pointer);
        const pub_pointer = new AllocatedBuf(
          module.OPAQUE_REGISTER_PUBLIC_LEN,
          module
        );
        pointers.push(pub_pointer);
        if (
          0 !==
          module.Create1kRegistrationResponse(
            M_pointer.address,
            pkS_pointer.address,
            sec_pointer.address,
            pub_pointer.address
          )
        ) {
          const error = new Error("Create1kRegistrationResponse failed.");
          error.name = "OpaqueError";
          throw error;
        }
        return {
          sec: sec_pointer.toUint8Array(),
          pub: pub_pointer.toUint8Array(),
        };
      } catch (e) {
        if (e.name === "OpaqueError") throw e;
        const error = new Error(
          "create1kRegistrationResponse failed. (" + e.name + ") " + e.message
        );
        error.name = "OpaqueError";
        error.cause = e;
        throw error;
      } finally {
        zeroAndFree(pointers);
      }
    }

    Module["finalizeRequest"] = (params) => {
      return finalizeRequest(Module, params);
    };
    Module["FinalizeRequest"] = Module.cwrap(
      "opaquejs_FinalizeRequest",
      "number",
      [
        "number", // const uint8_t sec[OPAQUE_REGISTER_USER_SEC_LEN/*+pwdU_len*/],
        "number", // const uint8_t pub[OPAQUE_REGISTER_PUBLIC_LEN],
        "number", // const uint8_t cfg_skU,
        "number", // const uint8_t cfg_pkU,
        "number", // const uint8_t cfg_pkS,
        "number", // const uint8_t cfg_idS,
        "number", // const uint8_t cfg_idU,
        "string", // const uint8_t *ids_idU,
        "number", // const uint16_t ids_idU_len,
        "string", // const uint8_t *ids_idS,
        "number", // const uint16_t ids_idS_len,
        "number", // uint8_t rec[OPAQUE_USER_RECORD_LEN/*+envU_len*/],
        "number", // uint8_t export_key[crypto_hash_sha256_BYTES]);
      ]
    );
    function finalizeRequest(module, params) {
      const pointers = [];
      try {
        const {
          sec, // required
          pub, // required
          cfg, // required
          ids, // required
        } = params;
        validateUint8Arrays({ sec, pub });
        validatePkgConfig(cfg);
        validateRequiredStrings(ids);

        const sec_pointer = AllocatedBuf.fromUint8ArrayInexact(
          sec,
          module.OPAQUE_REGISTER_USER_SEC_LEN /*+pwdU_len*/,
          module
        );
        pointers.push(sec_pointer);
        const pub_pointer = AllocatedBuf.fromUint8Array(
          pub,
          module.OPAQUE_REGISTER_PUBLIC_LEN,
          module
        );
        pointers.push(pub_pointer);

        const envU_len = module.getEnvelopeLen({ cfg, ids });
        const rec_pointer = new AllocatedBuf(
          module.OPAQUE_USER_RECORD_LEN + envU_len,
          module
        );
        pointers.push(rec_pointer);
        const export_key_pointer = new AllocatedBuf(
          module.crypto_hash_sha256_BYTES,
          module
        );
        pointers.push(export_key_pointer);

        if (
          0 !==
          module.FinalizeRequest(
            sec_pointer.address,
            pub_pointer.address,
            cfg.skU,
            cfg.pkU,
            cfg.pkS,
            cfg.idS,
            cfg.idU,
            ids.idU,
            ids.idU.length,
            ids.idS,
            ids.idS.length,
            rec_pointer.address,
            export_key_pointer.address
          )
        ) {
          const error = new Error("FinalizeRequest failed.");
          error.name = "OpaqueError";
          throw error;
        }
        return {
          rec: rec_pointer.toUint8Array(),
          export_key: export_key_pointer.toUint8Array(),
        };
      } catch (e) {
        if (e.name === "OpaqueError") throw e;
        const error = new Error(
          "finalizeRequest failed. (" + e.name + ") " + e.message
        );
        error.name = "OpaqueError";
        error.cause = e;
        throw error;
      } finally {
        zeroAndFree(pointers);
      }
    }

    Module["storeUserRecord"] = (params) => {
      return storeUserRecord(Module, params);
    };
    Module["StoreUserRecord"] = Module.cwrap("opaquejs_StoreUserRecord", null, [
      "number", // const uint8_t sec[OPAQUE_REGISTER_SECRET_LEN],
      "number", // uint8_t rec[OPAQUE_USER_RECORD_LEN/*+envU_len*/]);
    ]);
    function storeUserRecord(module, params) {
      const pointers = [];
      try {
        const {
          sec, // required
          rec, // required
        } = params;
        validateUint8Arrays({ sec, rec });
        const sec_pointer = AllocatedBuf.fromUint8Array(
          sec,
          module.OPAQUE_REGISTER_SECRET_LEN,
          module
        );
        pointers.push(sec_pointer);
        const rec_pointer = AllocatedBuf.fromUint8ArrayInexact(
          rec,
          module.OPAQUE_USER_RECORD_LEN /*+envU_len*/,
          module
        );
        pointers.push(rec_pointer);
        module.StoreUserRecord(sec_pointer.address, rec_pointer.address);
        return {
          rec: rec_pointer.toUint8Array(),
        };
      } catch (e) {
        if (e.name === "OpaqueError") throw e;
        const error = new Error(
          "storeUserRecord failed. (" + e.name + ") " + e.message
        );
        error.name = "OpaqueError";
        error.cause = e;
        throw error;
      } finally {
        zeroAndFree(pointers);
      }
    }

    Module["store1kUserRecord"] = (params) => {
      return store1kUserRecord(Module, params);
    };
    Module["Store1kUserRecord"] = Module.cwrap(
      "opaquejs_Store1kUserRecord",
      null,
      [
        "number", // const uint8_t sec[OPAQUE_REGISTER_SECRET_LEN],
        "number", // const uint8_t skS[crypto_scalarmult_SCALARBYTES],
        "number", // uint8_t rec[OPAQUE_USER_RECORD_LEN/*+envU_len*/]);
      ]
    );
    function store1kUserRecord(module, params) {
      const pointers = [];
      try {
        const {
          sec, // required
          skS, // required
          rec, // required
        } = params;
        validateUint8Arrays({ sec, skS, rec });
        const sec_pointer = AllocatedBuf.fromUint8Array(
          sec,
          module.OPAQUE_REGISTER_SECRET_LEN,
          module
        );
        pointers.push(sec_pointer);
        const skS_pointer = AllocatedBuf.fromUint8Array(
          skS,
          module.crypto_scalarmult_SCALARBYTES,
          module
        );
        pointers.push(skS_pointer);
        const rec_pointer = AllocatedBuf.fromUint8ArrayInexact(
          rec,
          module.OPAQUE_USER_RECORD_LEN /*+envU_len*/,
          module
        );
        pointers.push(rec_pointer);
        module.Store1kUserRecord(
          sec_pointer.address,
          skS_pointer.address,
          rec_pointer.address
        );
        return {
          rec: rec_pointer.toUint8Array(),
        };
      } catch (e) {
        if (e.name === "OpaqueError") throw e;
        const error = new Error(
          "store1kUserRecord failed. (" + e.name + ") " + e.message
        );
        error.name = "OpaqueError";
        error.cause = e;
        throw error;
      } finally {
        zeroAndFree(pointers);
      }
    }

    Module["getEnvelopeLen"] = (params) => {
      return getEnvelopeLen(Module, params);
    };
    Module["envelope_len"] = Module.cwrap("opaquejs_envelope_len", "number", [
      "number", // const uint8_t cfg_skU,
      "number", // const uint8_t cfg_pkU,
      "number", // const uint8_t cfg_pkS,
      "number", // const uint8_t cfg_idS,
      "number", // const uint8_t cfg_idU,
      "string", // const uint8_t *ids_idU,
      "number", // const uint16_t ids_idU_len,
      "string", // const uint8_t *ids_idS,
      "number", // const uint16_t ids_idS_len,
      "number", // uint32_t *envU_len
    ]);
    function getEnvelopeLen(module, params) {
      const pointers = [];
      try {
        const {
          cfg, // required
          ids, // required
        } = params;
        validateRequiredStrings(ids);
        validatePkgConfig(cfg);

        // uint32_t has 32 bits = 4 bytes.
        const envU_len_pointer = new AllocatedBuf(4, module);
        pointers.push(envU_len_pointer);
        if (
          0 !==
          module.envelope_len(
            cfg.skU,
            cfg.pkU,
            cfg.pkS,
            cfg.idS,
            cfg.idU,
            ids.idU,
            ids.idU.length,
            ids.idS,
            ids.idS.length,
            envU_len_pointer.address
          )
        ) {
          throw new Error("getEnvelopeLen failed.");
        }
        return module.getValue(envU_len_pointer.address, "i32");
      } catch (e) {
        if (e.name === "OpaqueError") throw e;
        const error = new Error(
          "register failed. (" + e.name + ") " + e.message
        );
        error.name = "OpaqueError";
        error.cause = e;
        throw error;
      } finally {
        zeroAndFree(pointers);
      }
    }

    Module["getServerPublicKeyFromUserRecord"] = (rec_base16) => {
      return getServerPublicKeyFromUserRecord(Module, rec_base16);
    };
    Module["server_public_key_from_user_record"] = Module.cwrap(
      "opaquejs_server_public_key_from_user_record",
      null,
      [
        "number", // const uint8_t rec[OPAQUE_USER_RECORD_LEN],
        "number", // uint8_t pkS[crypto_scalarmult_BYTES]);
      ]
    );
    function getServerPublicKeyFromUserRecord(module, rec) {
      const pointers = [];
      try {
        validateUint8Arrays({ rec });
        const rec_pointer = AllocatedBuf.fromUint8Array(
          rec,
          module.OPAQUE_USER_RECORD_LEN,
          module
        );
        pointers.push(rec_pointer);
        const pkS_pointer = new AllocatedBuf(
          module.crypto_scalarmult_BYTES,
          module
        );
        pointers.push(pkS_pointer);
        module.server_public_key_from_user_record(
          rec_pointer.address,
          pkS_pointer.address
        );
        return {
          pks: pkS_pointer.toUint8Array(),
        };
      } catch (e) {
        if (e.name === "OpaqueError") throw e;
        const error = new Error(
          "getServerPublicKeyFromUserRecord failed. (" +
            e.name +
            ") " +
            e.message
        );
        error.name = "OpaqueError";
        error.cause = e;
        throw error;
      } finally {
        zeroAndFree(pointers);
      }
    }

    // The following is from
    // https://github.com/jedisct1/libsodium/blob/2f915846ff41191c1a17357f0efaae9d500e9858/src/libsodium/randombytes/randombytes.c .
    // We can remove it once we upgrade libsodium to a version strictly greater
    // than 1.0.18.
    Module["getRandomValue"] = getRandomValueFunction();
    function getRandomValueFunction() {
      try {
        var window_ = "object" === typeof window ? window : self;
        var crypto_ =
          typeof window_.crypto !== "undefined"
            ? window_.crypto
            : window_.msCrypto;
        var randomValuesStandard = function () {
          var buf = new Uint32Array(1);
          crypto_.getRandomValues(buf);
          return buf[0] >>> 0;
        };
        randomValuesStandard();
        return randomValuesStandard;
      } catch (e) {
        try {
          var crypto = require("crypto");
          var randomValueNodeJS = function () {
            var buf = crypto["randomBytes"](4);
            return (
              ((buf[0] << 24) | (buf[1] << 16) | (buf[2] << 8) | buf[3]) >>> 0
            );
          };
          randomValueNodeJS();
          return randomValueNodeJS;
        } catch (e) {
          throw "No secure random number generator found";
        }
      }
    }

    Module["hexToUint8Array"] = hexToUint8Array;
    function hexToUint8Array(hex, length, array, index) {
      if (length == null && hex.length % 2 === 1)
        throw new TypeError("The hex string must have a length that is even.");
      const locLength = length != null ? length : hex.length / 2;
      const locArray = array != null ? array : new Array(length);
      const i = index != null ? index : 0;
      if (i >= locLength) return new Uint8Array(locArray);
      locArray[i] = parseInt(hex.substring(i * 2, (i + 1) * 2), 16);
      return hexToUint8Array(hex, locLength, locArray, i + 1);
    }

    Module["uint8ArrayEquals"] = uint8ArrayEquals;
    function uint8ArrayEquals(a, b, index) {
      if (index == null) {
        if (a === b) return true;
        if (a == null || b == null) return false;
        if (a.length !== b.length) return false;
      }
      const i = index != null ? index : 0;
      if (i >= a.length) return true;
      if (a[i] !== b[i]) return false;
      return uint8ArrayEquals(a, b, i + 1);
    }

    Module["uint8ArrayToHex"] = uint8ArrayToHex;
    function uint8ArrayToHex(buffer, hex, index) {
      const locBase16String = hex != null ? hex : "";
      const i = index != null ? index : 0;
      if (i >= buffer.length) return locBase16String;
      // -128 to 127
      const base10SignedByte = buffer[i];
      // 0 to 255
      const base10UnsignedByte =
        base10SignedByte < 0 ? base10SignedByte + 256 : base10SignedByte;
      const base16UnsignedByte = base10UnsignedByte.toString(16);
      const prefix = base16UnsignedByte.length < 2 ? "0" : "";
      return uint8ArrayToHex(
        buffer,
        locBase16String + prefix + base16UnsignedByte,
        i + 1
      );
    }
  }

  // See https://github.com/jedisct1/libsodium.js/blob/master/wrapper/wrap-template.js.
  function AllocatedBuf(length, module) {
    this.length = length;
    this.address = module._malloc(length);
    this.module = module;
  }

  AllocatedBuf.fromUint8Array = function (array, length, module) {
    if (array.length !== length)
      throw new TypeError(
        "The Uint8Array must have a length of " +
          length +
          ", not " +
          array.length +
          "."
      );
    const buffer = new AllocatedBuf(array.length, module);
    module.HEAPU8.set(array, buffer.address);
    return buffer;
  };

  AllocatedBuf.fromUint8ArrayInexact = function (array, length, module) {
    if (array.length <= length)
      throw new TypeError(
        "The Uint8Array must have a length of at least " +
          length +
          " exclusive, not " +
          array.length +
          "."
      );
    const buffer = new AllocatedBuf(array.length, module);
    module.HEAPU8.set(array, buffer.address);
    return buffer;
  };

  AllocatedBuf.prototype.toUint8Array = function () {
    const buffer = new Uint8Array(this.length);
    buffer.set(
      this.module.HEAPU8.subarray(this.address, this.address + this.length)
    );
    return buffer;
  };

  AllocatedBuf.prototype.zero = function (index) {
    const i = index != null ? index : 0;
    if (i >= this.length) return;
    this.module.setValue(this.address + i, 0, "i8");
    return this.zero(i + 1);
  };

  AllocatedBuf.prototype.zeroAndFree = function () {
    this.zero();
    this.module._free(this.address);
  };

  function validateOptionalStrings(object) {
    for (const [name, string] of Object.entries(object)) {
      if (string != null && (typeof string !== "string" || string.length < 1))
        throw new TypeError(
          "If defined, " + name + " must be a nonempty string."
        );
    }
  }

  function validatePkgConfig(cfg) {
    validatePkgTarget(cfg.skU, "cfg.skU");
    validatePkgTarget(cfg.pkU, "cfg.pkU");
    validatePkgTarget(cfg.pkS, "cfg.pkS");
    validatePkgTarget(cfg.idS, "cfg.idS");
    validatePkgTarget(cfg.idU, "cfg.idU");
  }

  function validatePkgTarget(cfg, name) {
    if (cfg !== 0 && cfg !== 1 && cfg !== 2)
      throw new RangeError(name + " (" + cfg + ") must be 0, 1, or 2.");
  }

  function validateRequiredStrings(object) {
    for (const [name, string] of Object.entries(object)) {
      if (typeof string !== "string" || string.length < 1)
        throw new TypeError(name + " must be a nonempty string.");
    }
  }

  function validateUint8Arrays(object) {
    for (const [name, buffer] of Object.entries(object)) {
      if (buffer == null)
        throw new TypeError(name + " must be a Uint8Array, not null.");
      else if (!(buffer instanceof Uint8Array))
        throw new TypeError(name + " must be a Uint8Array.");
      else if (buffer.length < 1)
        throw new TypeError(name + " cannot be empty.");
    }
  }

  function zeroAndFree(pointers, index) {
    const i = index != null ? index : 0;
    if (i >= pointers.length) return;
    pointers[i].zeroAndFree();
    return zeroAndFree(pointers, i + 1);
  }

  // This is similar to expose_libsodium in
  // https://github.com/jedisct1/libsodium.js/blob/master/wrapper/libsodium-pre.js .
  function exposeLibopaque(exports) {
    "use strict";
    var Module = exports;
    var _Module = Module;
    Module.ready = new Promise(function (resolve, reject) {
      var Module = _Module;
      Module.onAbort = reject;
      Module.onRuntimeInitialized = function () {
        try {
          wrapLibrary(Module);
          resolve();
        } catch (err) {
          reject(err);
        }
      };