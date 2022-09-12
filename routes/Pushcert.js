const express = require("express");
const mongoose = require("mongoose");
const Cert = mongoose.model("Cert");
// const Pk = mongoose.model('Pk')
const { ObjectId } = require("mongodb");

const router = express.Router();
let certif = `-----BEGIN CERTIFICATE-----
MIIDCzCCAfMCFGD73smNzse9SnZd73Y5uN8Ho9rVMA0GCSqGSIb3DQEBCwUAMEIx
CzAJBgNVBAYTAklOMRIwEAYDVQQIDAlLYXJuYXRha2ExEjAQBgNVBAcMCUJhbmdh
bG9yZTELMAkGA1UECwwCSVQwHhcNMjIwODI2MTEwNDEzWhcNMjMwODI2MTEwNDEz
WjBCMQswCQYDVQQGEwJJTjESMBAGA1UECAwJS2FybmF0YWthMRIwEAYDVQQHDAlC
YW5nYWxvcmUxCzAJBgNVBAsMAklUMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIB
CgKCAQEAq25hpKTi8fmOdU32tx5DNgdcV4ftiGr7Wuk934hlEM8mulmcq8xwPg4j
U0RzO7NUF99VqEYKtNRUNRPq5vGxCYGaJ5abeGc3AM7RkYjxIAc0BFRyPrpI7EsZ
iaZb1+7di/MUBOjOas7NRE+YK7H/nOCLT+c7E1BG48bKj48im2R3Z6fKMIx/XbdQ
nmXm1JFsIJvavA389987joWvxs/rJkkrUEgBDxt7Y55LrlBjYqSF7zdaS+aWL5Iv
Ak3onJogAqzSmqmbmsP5n0AR9CtbuIsqfKqqsUz7fjSCHTMrjcllhMh4Q6sMVU1T
zZdyUCEW0P3Pjz2AGoRlYuPwOE9YDwIDAQABMA0GCSqGSIb3DQEBCwUAA4IBAQBr
1Z/d8uos8Hkq+MKpXuuNZS4ODVjdI1IFaKMNNa/++rGN3Bfwf11GjhRYnl+RQ2Rz
K7fS4PhruVaeBh7xdGetgnkm7XMRt8huoouScx19qeUjIM6bz9A0Cqm73sWGJf5V
e4MejIMvtCbUdPNHsA2Im0JTp1SW49I/+zIBNBaKTOk7nhMOQ7JowC0xXJB1eVQO
SxMKKsHU/5KLk1MZ+slpIQrUJtK8IssfsWMGU/eIKgrfVhtI58ry1Kr2zR+Bnk/M
1h64WEaBzhp42Tee0EguckxnIhPIFuScEeMOgg3oZ9n+9GpIZOeUBDkUD3PlcxJJ
gLMvQM5/Oag7c1oOsJXz
-----END CERTIFICATE-----
`;
let pk = `-----BEGIN PRIVATE KEY-----
MIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCrbmGkpOLx+Y51
Tfa3HkM2B1xXh+2Iavta6T3fiGUQzya6WZyrzHA+DiNTRHM7s1QX31WoRgq01FQ1
E+rm8bEJgZonlpt4ZzcAztGRiPEgBzQEVHI+ukjsSxmJplvX7t2L8xQE6M5qzs1E
T5grsf+c4ItP5zsTUEbjxsqPjyKbZHdnp8owjH9dt1CeZebUkWwgm9q8Dfz33zuO
ha/Gz+smSStQSAEPG3tjnkuuUGNipIXvN1pL5pYvki8CTeicmiACrNKaqZuaw/mf
QBH0K1u4iyp8qqqxTPt+NIIdMyuNyWWEyHhDqwxVTVPNl3JQIRbQ/c+PPYAahGVi
4/A4T1gPAgMBAAECggEAA94RINxBbHETWC0imD38CS+AU08zOiUjt4jUhwL2OLtb
pc+Yu714eMXr4RiFuv6QMpusvIeb/TlfDvV8kqo4Mr00Q5lft4colAGWc8CRpAXV
lBVtoGGmfIIzOMpCfywZ3mrk9DlmUr2InvZmufGhkSH1sp9GU2i3uLLG5hc2EihY
HuoMo7BSzvKLGb0ouf0j/o1PVVe0JBwX/iQQ27Av5dKgHpM2yb0qBIjc0syM46xR
wDwmLmASPdYKxnn8Y2iCv29xrPmnHcqCm+MZha1NaCEEwJVdrSgAEr1W1CqQpQ7d
QxCoJXdXi2mGNtu+Wj/6h3p6LBzwVrPFBWyJtJ8oIQKBgQDWFdJMYpNq+fZ39wdC
pAn6wKfgOj+VpbEtFaXHqbcPqqGSllTLtrtPMNi1/GX6pUCT5i7cpeJh2Ru9lNxS
Tm1bso4bGYq2E1hwcwgvGrxIw8b5o8AWzzMkLCbTH6nblvJ8DRGdpNng/tg1XZ5U
eSna6QW4Vx7X2SkWj9QOh26kYQKBgQDM/rF3ndgYaWgDSTfy3CRnpSjlLvLEgdd2
7Thivs9XSE/oKrLSI6kGEj2Z6L0vTWnupkTvJKF9VfsONdFclCTyueFnLW7gFaO9
ZQ+7PK2nGLUlv4eUDXGsmQ865LU8+6+jcPm9QBtcjfCNRdGaKVO7yKDMOvUcJ12b
UpNdjQ9SbwKBgGfSx11CBSpBNTVyuLOp6CkSW5fTx9hkNauervpIpT3Uy2zSuSbe
ZLKABukjEbXfhJT1cc6SKFq5tslXMw47eK+axW4BEhNBCIfoUZS+i4diYtHYhyTI
sY2eV+nVlkOnTcu5bsycEQobrXEcCNgAtrqyfZKrtYqKh3GoqPeu2IqhAoGAUfYH
SLcgfmoufxnYN87S82mylyeVQwJS/qbMI5b82X39DOt9gc1mOBo07QOEGJSQJS3v
Y9o2gyFMdpsH8Ub+Gto9B/6/VPLx+7ibeJZDLAsR6lzQvV4+s+6iiz6ERDSxPdze
zU8DYZcStblTm5qocu09dUqhU7ddksuKRh4vIRsCgYBBNplxLY/8lydgXg7E/CVQ
HsA1bf7f/ohTvCYOz0qwkmlGIVkOkPuSJ9eYvlWSW1bQ+2ERffigLT0jz9y1aUkD
h9eFEe1biSmbBwqoVe3D876PBR63Wv23Kv28BdbxfgQEjGWEy1ifdmOFFkrc8MeC
mnnXObc9mouiojhkj2zm1Q==
-----END PRIVATE KEY-----
`;

router.post("/addcert", async (req, res) => {
    let id = ObjectId();
    const newCert = new Cert({
        _id: id,
        cert: certif,
        domain: req.body.domain,
        email: req.body.email,
    });

    const newPk = new Pk({
        certId: id,
        pk: pk,
    });

    try {
        await newCert.save();
    } catch (err) {
        console.log(err);
        const error = new Error("Certificate Add Failed");
        error.code = 500;
        return res.status(error.code).json({ error: error.message });
    }
    try {
        await newPk.save();
    } catch (err) {
        console.log(err);
        const error = new Error("Private Key Add Failed");
        error.code = 500;
        return res.status(error.code).json({ error: error.message });
    }

    return res.json({ Success: "Save Success!", Id: id });
});

module.exports = router;
