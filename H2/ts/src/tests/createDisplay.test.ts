import {getFullnodeUrl, SuiClient} from "@mysten/sui/client";
import {Transaction} from "@mysten/sui/transactions";
import {ENV} from "../env";

test("Create Display - Devnet", async () => {

    const suiClient = new SuiClient({ url: getFullnodeUrl("devnet") });
    const tx = new Transaction();

    let keys = ["name", "image_url", "description"];
    let values = [
        "{name}",
        "https://aggregator.walrus-testnet.walrus.space/v1/blobs/{blob_id}",
        "{name} - A true Hero of the Sui ecosystem!"
    ];

    // create the display object
    let display = tx.moveCall({
        target: "0x2::display::new_with_fields",
        arguments: [
            tx.object(ENV.PUBLISHER_ID),
            tx.pure.vector("string", keys),
            tx.pure.vector("string", values),
        ],
        typeArguments: [`${ENV.DISPLAY_PACKAGE_ID}::hero::Hero`],
    })

    // update the display version
    tx.moveCall({
        target: "0x2::display::update_version",
        arguments: [display],
        typeArguments: [`${ENV.DISPLAY_PACKAGE_ID}::hero::Hero`],
    });

    // Transfer the display object to your address
    tx.transferObjects([display], tx.pure.address(ENV.MY_ADDRESS))

    tx.setGasBudget(1000000000);
    tx.setSender(ENV.MY_ADDRESS);

    let buildTx = await tx.build({client: suiClient, onlyTransactionKind: false});

    const response = await suiClient.dryRunTransactionBlock({ transactionBlock: buildTx });
    console.log("Dry Run Transaction Response: ", response);
    expect(response.effects.status.status).toBe("success");
})
