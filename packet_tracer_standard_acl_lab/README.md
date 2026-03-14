# Configuration of Standard Access List (Packet Tracer Lab)

This pack recreates the lab from **Configuration of Standard Access List.pdf**.

## What you can open on your laptop
- `README.md`
- `addressing_table.csv`
- `R1.cfg`
- `R0.cfg`
- `R2.cfg`
- `topology_reference.png`

## Topology summary
- Left LAN: `10.0.0.0/24` behind `R1`
- Bottom LAN: `11.0.0.0/24` behind `R0`
- Right LAN: `12.0.0.0/24` behind `R2`
- R1-R0 WAN: `13.0.0.0/24`
- R0-R2 WAN: `14.0.0.0/24`

## Router roles
- `R1`: gateway for 10.0.0.0
- `R0`: core/transit + gateway for 11.0.0.0
- `R2`: gateway for 12.0.0.0 and ACL placement

## ACL behavior configured on R2
Standard ACL `10` blocks traffic going to network `12.0.0.0/24` from:
- host `10.0.0.2`
- host `10.0.0.3`
- subnet `11.0.0.0/24`
Then permits all remaining sources.

Applied on `R2` LAN interface outbound:
- `interface FastEthernet0/0`
- `ip access-group 10 out`

## Build steps in Packet Tracer
1. Create topology with 3 routers, 3 switches, and PCs as in `topology_reference.png`.
2. Assign PC IP/gateway values from `addressing_table.csv`.
3. On each router, paste matching config file (`R1.cfg`, `R0.cfg`, `R2.cfg`) in CLI.
4. If your serial interface numbering differs, update interface IDs only (keep IPs/routes/ACL the same).
5. Save each router config.

## Verification commands
Run on routers:
- `show ip route`
- `show access-lists`
- `show run | section access-list`
- `show run interface fa0/0`

Suggested pings:
- Blocked: `10.0.0.2 -> 12.0.0.2` (should fail)
- Blocked: `10.0.0.3 -> 12.0.0.2` (should fail)
- Allowed: `10.0.0.4 -> 12.0.0.2` (should pass)
- Blocked: `11.0.0.2 -> 12.0.0.2` (should fail)
