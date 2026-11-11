package com.unifor.br.distrischool.attendance_service.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    @Value("${distrischool.rabbitmq.exchange:distrischool.events}")
    private String exchangeName;

    @Value("${distrischool.rabbitmq.attendance-queue:attendance.queue}")
    private String queueName;

    @Value("${distrischool.rabbitmq.attendance-routing-key:attendance.recorded}")
    private String routingKey;

    @Bean
    public TopicExchange eventsExchange() {
        return new TopicExchange(exchangeName, true, false);
    }

    @Bean
    public Queue attendanceQueue() {
        return QueueBuilder.durable(queueName).build();
    }

    @Bean
    public Binding attendanceBinding(Queue attendanceQueue, TopicExchange eventsExchange) {
        return BindingBuilder.bind(attendanceQueue).to(eventsExchange).with(routingKey);
    }

    @Bean
    public MessageConverter messageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public AmqpTemplate amqpTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(messageConverter());
        return template;
    }
}
