
export function ScriptDangerously({
    nonce,
    html,
}: {
    nonce?: string;
    html: string;
}) {
    return (
        <script
            nonce={nonce}
            dangerouslySetInnerHTML={{
                __html: html,
            }
            }
        />
    );
}