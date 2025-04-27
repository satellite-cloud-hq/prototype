{
  plugs: {
    sils_uart: "ws://simulator:9696/channels/3",
    gaia: "ws://tlmcmd-bridge:8910",
    eb90dec: "exec:kble-eb90 decode",
    eb90enc: "exec:kble-eb90 encode",
    to_aos_tf: "exec:kble-c2a spacepacket to-aos-tf",
    from_tc_tf: "exec:kble-c2a spacepacket from-tc-tf",
  },
  links: {
    # uplink chain
    gaia: "from_tc_tf",
    from_tc_tf: "eb90enc",
    eb90enc: "sils_uart",

    # downlink chain
    sils_uart: "eb90dec",
    eb90dec: "to_aos_tf",
    to_aos_tf: "gaia",
  }
}
