import React from "react";
import { View, Text } from "react-native";

import { Evento } from "../../../types/agenda/agendaTypes";
import { styles } from "../../styles/agenda/agendaStyles";

interface Props {
  proximo?: Evento;
}

export const NextEventCard = ({ proximo }: Props) => {
  return (
    <View style={styles.nextEventCard}>
      <Text style={styles.nextEventTitle}>Tu próximo evento es el:</Text>

      {proximo ? (
        <>
          <Text style={styles.eventName}>{proximo.titulo}</Text>
          <Text style={styles.eventDate}>
            {proximo.fecha} a las {proximo.hora}
          </Text>
        </>
      ) : (
        <Text style={styles.noEventText}>Aún no tienes eventos.</Text>
      )}
    </View>
  );
};